import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

function toBookingRequest(booking: Booking) {
  return {
    id: booking.id,
    date: booking.date,
    time: booking.time,
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
    date: booking.date,
    time: booking.time,
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
  ) {}

  async create(customerId: string, dto: CreateBookingDto) {
    const freelancer = await this.usersRepository.findOne({
      where: { id: dto.freelancerId, role: UserRole.FREELANCER },
    });
    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    const booking = this.bookingsRepository.create({
      freelancerId: freelancer.id,
      customerId,
      date: dto.date,
      time: dto.time,
      notes: dto.notes,
    });
    return this.bookingsRepository.save(booking);
  }

  async findForFreelancer(freelancerId: string) {
    const bookings = await this.bookingsRepository.find({
      where: { freelancerId },
      relations: ['customer'],
      order: { date: 'ASC', time: 'ASC' },
    });
    return bookings.map(toBookingRequest);
  }

  async findForCustomer(customerId: string) {
    const bookings = await this.bookingsRepository.find({
      where: { customerId },
      relations: ['freelancer'],
      order: { date: 'ASC', time: 'ASC' },
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
      relations: ['customer'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.freelancerId !== freelancerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }

    booking.status =
      dto.status === 'accepted' ? BookingStatus.ACCEPTED : BookingStatus.DECLINED;
    const saved = await this.bookingsRepository.save(booking);
    return toBookingRequest(saved);
  }

  async cancel(customerId: string, bookingId: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['freelancer'],
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
    return toCustomerBooking(saved);
  }
}
