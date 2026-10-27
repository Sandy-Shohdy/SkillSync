import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus, BookingType } from './entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import {
  CURRENCY,
  PaymentsService,
  toPaymentSummary,
} from '../payments/payments.service';
import { PaymentStatus } from '../payments/entities/payment.entity';

function toBookingRequest(booking: Booking) {
  return {
    id: booking.id,
    type: booking.type,
    date: booking.date ?? null,
    time: booking.time ?? null,
    phone: booking.phone ?? null,
    notes: booking.notes ?? null,
    status: booking.status,
    hours: booking.hours ?? null,
    amount: booking.amount ?? null,
    currency: CURRENCY,
    workCompletedAt: booking.workCompletedAt ?? null,
    payment: toPaymentSummary(booking.payment),
    createdAt: booking.createdAt,
    customer: {
      id: booking.customer.id,
      fullName: booking.customer.fullName,
      email: booking.customer.email,
      phone: booking.customer.phone,
    },
  };
}

function bookingNoun(type: BookingType) {
  return type === BookingType.INQUIRY ? 'call back request' : 'booking';
}

function toCustomerBooking(booking: Booking) {
  return {
    id: booking.id,
    type: booking.type,
    date: booking.date ?? null,
    time: booking.time ?? null,
    phone: booking.phone ?? null,
    notes: booking.notes ?? null,
    status: booking.status,
    hours: booking.hours ?? null,
    amount: booking.amount ?? null,
    currency: CURRENCY,
    workCompletedAt: booking.workCompletedAt ?? null,
    payment: toPaymentSummary(booking.payment),
    createdAt: booking.createdAt,
    freelancer: {
      id: booking.freelancer.id,
      fullName: booking.freelancer.fullName,
      avatarUrl: booking.freelancer.avatarUrl ?? null,
      category: booking.freelancer.category ?? null,
      location: booking.freelancer.location ?? null,
      pricePerHour: booking.freelancer.pricePerHour ?? null,
    },
  };
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(customerId: string, dto: CreateBookingDto) {
    const freelancer = await this.usersRepository.findOne({
      where: { id: dto.freelancerId, role: UserRole.FREELANCER },
    });
    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }
    const customer = await this.usersRepository.findOne({
      where: { id: customerId },
    });

    const type = dto.type ?? BookingType.APPOINTMENT;
    let amount: number | null = null;
    if (type === BookingType.APPOINTMENT) {
      if (!dto.hours) {
        throw new BadRequestException('Choose how many hours you need');
      }
      if (!freelancer.pricePerHour) {
        throw new BadRequestException(
          "This freelancer hasn't set an hourly rate yet. Request a call back instead.",
        );
      }
      amount = freelancer.pricePerHour * dto.hours * 100;
    }

    const booking = this.bookingsRepository.create({
      freelancerId: freelancer.id,
      customerId,
      type,
      date: dto.date,
      time: dto.time,
      phone: dto.phone,
      notes: dto.notes,
      hours: type === BookingType.APPOINTMENT ? dto.hours : null,
      amount,
    });
    const saved = await this.bookingsRepository.save(booking);

    const customerName = customer?.fullName ?? 'A customer';
    await this.notificationsService.create(
      freelancer.id,
      NotificationType.BOOKING_CREATED,
      type === BookingType.INQUIRY
        ? `${customerName} wants a call back`
        : `${customerName} requested a ${saved.hours} h booking for ${saved.date} at ${saved.time}`,
      saved.id,
    );

    return saved;
  }

  async findForFreelancer(freelancerId: string) {
    await this.paymentsService.releaseOverdue({ freelancerId });
    const bookings = await this.bookingsRepository.find({
      where: { freelancerId },
      relations: ['customer', 'payment'],
      order: { createdAt: 'DESC' },
    });
    return bookings.map(toBookingRequest);
  }

  async findForCustomer(customerId: string) {
    await this.paymentsService.releaseOverdue({ customerId });
    const bookings = await this.bookingsRepository.find({
      where: { customerId },
      relations: ['freelancer', 'payment'],
      order: { createdAt: 'DESC' },
    });
    return bookings.map(toCustomerBooking);
  }

  async updateStatus(
    freelancerId: string,
    bookingId: string,
    dto: UpdateBookingStatusDto,
  ) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'freelancer'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.freelancerId !== freelancerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('This booking has already been answered');
    }

    const accepted = dto.status === 'accepted';
    booking.status = accepted ? BookingStatus.ACCEPTED : BookingStatus.DECLINED;
    const saved = await this.bookingsRepository.save(booking);

    const noun = bookingNoun(booking.type);
    await this.notificationsService.create(
      booking.customerId,
      accepted ? NotificationType.BOOKING_ACCEPTED : NotificationType.BOOKING_DECLINED,
      `${booking.freelancer.fullName} ${accepted ? 'accepted' : 'declined'} your ${noun}`,
      booking.id,
    );

    return toBookingRequest(saved);
  }

  async cancel(customerId: string, bookingId: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['freelancer', 'customer'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.ACCEPTED
    ) {
      throw new BadRequestException('This booking is already closed');
    }
    if (booking.workCompletedAt) {
      throw new BadRequestException(
        'The freelancer has marked this job as done, so it can no longer be cancelled',
      );
    }

    const refunded = await this.paymentsService.refundIfHeld(booking.id);
    booking.status = BookingStatus.CANCELLED;
    const saved = await this.bookingsRepository.save(booking);

    const noun = bookingNoun(booking.type);
    await this.notificationsService.create(
      booking.freelancerId,
      NotificationType.BOOKING_CANCELLED,
      `${booking.customer.fullName} cancelled their ${noun}${refunded ? ' and was refunded' : ''}`,
      booking.id,
    );

    saved.payment = await this.paymentsService.findForBooking(booking.id);
    return toCustomerBooking(saved);
  }

  async markCompleted(freelancerId: string, bookingId: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'freelancer', 'payment'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.freelancerId !== freelancerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    if (booking.status !== BookingStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted bookings can be completed');
    }
    if (booking.payment?.status !== PaymentStatus.HELD) {
      throw new BadRequestException(
        'The customer has to pay before the job can be marked as done',
      );
    }
    if (booking.workCompletedAt) {
      throw new BadRequestException('This job is already marked as done');
    }

    const autoReleaseAt = await this.paymentsService.startReviewPeriod(
      booking.id,
    );
    booking.workCompletedAt = new Date();
    const saved = await this.bookingsRepository.save(booking);

    await this.notificationsService.create(
      booking.customerId,
      NotificationType.WORK_COMPLETED,
      `${booking.freelancer.fullName} marked your booking as done. Release the payment or report a problem by ${autoReleaseAt.toLocaleDateString('sv-SE')}, or it will be released automatically.`,
      booking.id,
    );

    saved.payment = await this.paymentsService.findForBooking(booking.id);
    return toBookingRequest(saved);
  }
}
