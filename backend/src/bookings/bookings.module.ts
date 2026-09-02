import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { JwtConfigModule } from '../auth/jwt-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User]), JwtConfigModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
