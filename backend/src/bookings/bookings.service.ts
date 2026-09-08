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

function toBookingRequest(booking: Booking) {
  return {
    id: booking.id,
    type: booking.type,
    date: booking.date ?? null,
    time: booking.time ?? null,
    phone: booking.phone ?? null,
    notes: booking.notes ?? null,
    status: booking.status,
    createdAt: booking.createdAt,
    customer: {
      id: booking.customer.id,
      fullName: booking.customer.fullName,
      email: booking.customer.email,
      phone: booking.customer.phone,
    },
  };
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
    const booking = this.bookingsRepository.create({
      freelancerId: freelancer.id,
      customerId,
      type,
      date: dto.date,
      time: dto.time,
      phone: dto.phone,
      notes: dto.notes,
    });
    const saved = await this.bookingsRepository.save(booking);

    const customerName = customer?.fullName ?? 'A customer';
    await this.notificationsService.create(
      freelancer.id,
      NotificationType.BOOKING_CREATED,
      type === BookingType.INQUIRY
        ? `${customerName} wants a call back`
        : `${customerName} requested a booking for ${saved.date} at ${saved.time}`,
      saved.id,
    );

    return saved;
  }

  async findForFreelancer(freelancerId: string) {
    const bookings = await this.bookingsRepository.find({
      where: { freelancerId },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
    return bookings.map(toBookingRequest);
  }

  async findForCustomer(customerId: string) {
    const bookings = await this.bookingsRepository.find({
      where: { customerId },
      relations: ['freelancer'],
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

    const accepted = dto.status === 'accepted';
    booking.status = accepted ? BookingStatus.ACCEPTED : BookingStatus.DECLINED;
    const saved = await this.bookingsRepository.save(booking);

    const noun =
      booking.type === BookingType.INQUIRY ? 'call back request' : 'booking';
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
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.DECLINED
    ) {
      throw new BadRequestException('This booking is already closed');
    }

    booking.status = BookingStatus.CANCELLED;
    const saved = await this.bookingsRepository.save(booking);

    const noun =
      booking.type === BookingType.INQUIRY ? 'call back request' : 'booking';
    await this.notificationsService.create(
      booking.freelancerId,
      NotificationType.BOOKING_CANCELLED,
      `${booking.customer.fullName} cancelled their ${noun}`,
      booking.id,
    );

    return toCustomerBooking(saved);
  }
}
