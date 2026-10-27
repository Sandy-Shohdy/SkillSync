import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, QueryFailedError, Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import {
  Booking,
  BookingStatus,
  BookingType,
} from '../bookings/entities/booking.entity';
import { PayBookingDto } from './dto/pay-booking.dto';
import { DisputePaymentDto } from './dto/dispute-payment.dto';
import { PaymentDeclinedError, PaymentProvider } from './payment-provider';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

export const CURRENCY = 'SEK';

export function toPaymentSummary(payment: Payment | null | undefined) {
  if (!payment) return null;
  return {
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    platformFee: payment.platformFee,
    freelancerAmount: payment.freelancerAmount,
    currency: payment.currency,
    cardLast4: payment.cardLast4,
    createdAt: payment.createdAt,
    autoReleaseAt: payment.autoReleaseAt ?? null,
    disputedAt: payment.disputedAt ?? null,
    disputeReason: payment.disputeReason ?? null,
    releasedAt: payment.releasedAt ?? null,
    refundedAt: payment.refundedAt ?? null,
  };
}

function formatAmount(minor: number) {
  return `${(minor / 100).toLocaleString('sv-SE')} ${CURRENCY}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Payments still waiting on the customer, i.e. not yet released or refunded.
const OPEN_STATUSES = [PaymentStatus.HELD, PaymentStatus.DISPUTED];

function readDays(config: ConfigService, key: string, fallback: number) {
  const value = Number(config.get(key, fallback));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function isUniqueViolation(error: unknown) {
  return (
    error instanceof QueryFailedError &&
    (error as QueryFailedError & { code?: string }).code === '23505'
  );
}

@Injectable()
export class PaymentsService {
  private readonly feePercent: number;
  private readonly reviewDays: number;
  private readonly disputeDays: number;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly provider: PaymentProvider,
    private readonly notificationsService: NotificationsService,
    config: ConfigService,
  ) {
    const fee = Number(config.get('PLATFORM_FEE_PERCENT', 10));
    this.feePercent = Number.isFinite(fee) && fee >= 0 && fee < 100 ? fee : 10;
    this.reviewDays = readDays(config, 'PAYMENT_REVIEW_DAYS', 3);
    this.disputeDays = readDays(config, 'PAYMENT_DISPUTE_DAYS', 14);
  }

  findForBooking(bookingId: string) {
    return this.paymentsRepository.findOne({ where: { bookingId } });
  }

  async pay(customerId: string, bookingId: string, dto: PayBookingDto) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'freelancer', 'payment'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    if (booking.type !== BookingType.APPOINTMENT || !booking.amount) {
      throw new BadRequestException('This booking has no price to pay');
    }
    if (booking.status !== BookingStatus.ACCEPTED) {
      throw new BadRequestException(
        'You can pay once the freelancer has accepted the booking',
      );
    }
    if (booking.payment) {
      throw new ConflictException('This booking has already been paid');
    }

    const [month, year] = dto.expiry.split('/').map(Number);
    const amount = booking.amount;
    const platformFee = Math.round((amount * this.feePercent) / 100);

    let charge;
    try {
      charge = await this.provider.charge(
        amount,
        CURRENCY,
        {
          number: dto.cardNumber.replace(/\s/g, ''),
          expMonth: month,
          expYear: 2000 + year,
          cvc: dto.cvc,
        },
        `SkillSync booking ${booking.id}`,
      );
    } catch (error) {
      if (error instanceof PaymentDeclinedError) {
        throw new HttpException(error.message, HttpStatus.PAYMENT_REQUIRED);
      }
      throw error;
    }

    let payment: Payment;
    try {
      payment = await this.paymentsRepository.save(
        this.paymentsRepository.create({
          bookingId: booking.id,
          customerId,
          freelancerId: booking.freelancerId,
          amount,
          platformFee,
          freelancerAmount: amount - platformFee,
          currency: CURRENCY,
          status: PaymentStatus.HELD,
          provider: this.provider.name,
          providerReference: charge.reference,
          cardLast4: charge.last4,
        }),
      );
    } catch (error) {
      // A concurrent request paid first; give this charge back.
      await this.provider.refund(charge.reference, amount);
      if (isUniqueViolation(error)) {
        throw new ConflictException('This booking has already been paid');
      }
      throw error;
    }

    await this.notificationsService.create(
      booking.freelancerId,
      NotificationType.PAYMENT_RECEIVED,
      `${booking.customer.fullName} paid ${formatAmount(amount)} for their booking. It's held safely until the job is done.`,
      booking.id,
    );

    return toPaymentSummary(payment);
  }

  async release(customerId: string, bookingId: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'payment'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    if (
      booking.status !== BookingStatus.ACCEPTED ||
      !booking.payment ||
      !OPEN_STATUSES.includes(booking.payment.status)
    ) {
      throw new BadRequestException('There is no held payment to release');
    }

    await this.settleRelease(booking.payment);
    await this.notificationsService.create(
      booking.freelancerId,
      NotificationType.PAYMENT_RELEASED,
      `${booking.customer.fullName} released ${formatAmount(booking.payment.freelancerAmount)} to you`,
      booking.id,
    );

    return toPaymentSummary(await this.findForBooking(booking.id));
  }

  // Starts the customer's review window once the freelancer marks the job done.
  async startReviewPeriod(bookingId: string): Promise<Date> {
    const autoReleaseAt = new Date(Date.now() + this.reviewDays * DAY_MS);
    const result = await this.paymentsRepository.update(
      { bookingId, status: PaymentStatus.HELD },
      { autoReleaseAt },
    );
    if (!result.affected) {
      throw new BadRequestException(
        'The customer has to pay before the job can be marked as done',
      );
    }
    return autoReleaseAt;
  }

  async dispute(customerId: string, bookingId: string, dto: DisputePaymentDto) {
    await this.releaseOverdue({ customerId });
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'payment'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    const payment = booking.payment;
    if (!payment || payment.status !== PaymentStatus.HELD) {
      throw new BadRequestException(
        payment?.status === PaymentStatus.DISPUTED
          ? 'You have already reported a problem with this booking'
          : 'There is no held payment to dispute',
      );
    }
    if (!booking.workCompletedAt) {
      throw new BadRequestException(
        'The job is not marked as done yet. You can cancel the booking for a refund instead.',
      );
    }

    const autoReleaseAt = new Date(Date.now() + this.disputeDays * DAY_MS);
    const result = await this.paymentsRepository.update(
      { id: payment.id, status: PaymentStatus.HELD },
      {
        status: PaymentStatus.DISPUTED,
        disputedAt: new Date(),
        disputeReason: dto.reason.trim(),
        autoReleaseAt,
      },
    );
    if (!result.affected) {
      throw new ConflictException('This payment has already been settled');
    }

    await this.notificationsService.create(
      booking.freelancerId,
      NotificationType.PAYMENT_DISPUTED,
      `${booking.customer.fullName} reported a problem: "${dto.reason.trim()}". Sort it out with them or refund them. Otherwise the payment is released to you on ${autoReleaseAt.toLocaleDateString('sv-SE')}.`,
      booking.id,
    );

    return toPaymentSummary(await this.findForBooking(booking.id));
  }

  // Freelancer gives the money back, e.g. to settle a reported problem.
  async refundByFreelancer(freelancerId: string, bookingId: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['freelancer', 'payment'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.freelancerId !== freelancerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    if (!booking.payment || !OPEN_STATUSES.includes(booking.payment.status)) {
      throw new BadRequestException('There is no held payment to refund');
    }

    await this.refundPayment(booking.payment, OPEN_STATUSES);
    await this.bookingsRepository.update(
      { id: booking.id },
      { status: BookingStatus.CANCELLED },
    );
    await this.notificationsService.create(
      booking.customerId,
      NotificationType.PAYMENT_REFUNDED,
      `${booking.freelancer.fullName} refunded your payment of ${formatAmount(booking.payment.amount)}`,
      booking.id,
    );

    return toPaymentSummary(await this.findForBooking(booking.id));
  }

  // Returns true when a held payment was refunded.
  async refundIfHeld(bookingId: string): Promise<boolean> {
    const payment = await this.findForBooking(bookingId);
    if (!payment || payment.status !== PaymentStatus.HELD) return false;
    await this.refundPayment(payment, [PaymentStatus.HELD]);
    return true;
  }

  /**
   * Releases payments whose review or dispute window has passed. Called on
   * reads (the API is serverless, so there is no background timer) and by
   * the cron endpoint.
   */
  async releaseOverdue(
    scope: { freelancerId?: string; customerId?: string } = {},
  ): Promise<number> {
    const overdue = await this.paymentsRepository.find({
      where: {
        ...scope,
        status: In(OPEN_STATUSES),
        autoReleaseAt: LessThanOrEqual(new Date()),
      },
      relations: ['booking', 'booking.customer'],
    });

    let released = 0;
    for (const payment of overdue) {
      try {
        await this.settleRelease(payment);
      } catch (error) {
        if (error instanceof ConflictException) continue;
        throw error;
      }
      released++;
      const amount = formatAmount(payment.freelancerAmount);
      await this.notificationsService.create(
        payment.freelancerId,
        NotificationType.PAYMENT_RELEASED,
        `${amount} from ${payment.booking.customer.fullName} was released to you automatically`,
        payment.bookingId,
      );
      await this.notificationsService.create(
        payment.customerId,
        NotificationType.PAYMENT_RELEASED,
        `Your payment of ${formatAmount(payment.amount)} was released to the freelancer automatically`,
        payment.bookingId,
      );
    }
    return released;
  }

  private async settleRelease(payment: Payment) {
    // Conditional update so a payment can only be settled once.
    const result = await this.paymentsRepository.update(
      { id: payment.id, status: In(OPEN_STATUSES) },
      { status: PaymentStatus.RELEASED, releasedAt: new Date() },
    );
    if (!result.affected) {
      throw new ConflictException('This payment has already been settled');
    }
    await this.bookingsRepository.update(
      { id: payment.bookingId },
      { status: BookingStatus.COMPLETED },
    );
  }

  private async refundPayment(payment: Payment, from: PaymentStatus[]) {
    const result = await this.paymentsRepository.update(
      { id: payment.id, status: In(from) },
      { status: PaymentStatus.REFUNDED, refundedAt: new Date() },
    );
    if (!result.affected) {
      throw new ConflictException('This payment has already been settled');
    }
    try {
      await this.provider.refund(payment.providerReference, payment.amount);
    } catch (error) {
      await this.paymentsRepository.update(
        { id: payment.id },
        { status: payment.status, refundedAt: null },
      );
      throw error;
    }
  }

  async earnings(freelancerId: string) {
    await this.releaseOverdue({ freelancerId });
    const payments = await this.paymentsRepository.find({
      where: { freelancerId },
      relations: ['booking', 'booking.customer'],
      order: { createdAt: 'DESC' },
    });

    const sum = (...statuses: PaymentStatus[]) =>
      payments
        .filter((p) => statuses.includes(p.status))
        .reduce((total, p) => total + p.freelancerAmount, 0);

    return {
      currency: CURRENCY,
      feePercent: this.feePercent,
      held: sum(...OPEN_STATUSES),
      released: sum(PaymentStatus.RELEASED),
      payments: payments.map((payment) => ({
        ...toPaymentSummary(payment)!,
        bookingId: payment.bookingId,
        bookingDate: payment.booking.date ?? null,
        bookingTime: payment.booking.time ?? null,
        hours: payment.booking.hours ?? null,
        customerName: payment.booking.customer.fullName,
      })),
    };
  }
}
