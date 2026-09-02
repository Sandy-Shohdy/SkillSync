import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateBookingDto) {
    if (req.user.role !== 'customer') {
      throw new ForbiddenException('Only customers can request bookings');
    }
    return this.bookingsService.create(req.user.sub, dto);
  }

  @Get('me')
  findMine(@Req() req: AuthedRequest) {
    if (req.user.role !== 'freelancer') {
      throw new ForbiddenException('Only freelancers can view booking requests');
    }
    return this.bookingsService.findForFreelancer(req.user.sub);
  }
}
