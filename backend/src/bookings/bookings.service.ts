import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

function toBookingRequest(booking: Booking) {
  return {
    id: booking.id,
    date: booking.date,
    time: booking.time,
    notes: booking.notes ?? null,
    createdAt: booking.createdAt,
    customer: {
      id: booking.customer.id,
      fullName: booking.customer.fullName,
      email: booking.customer.email,
      phone: booking.customer.phone,
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
}
