import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { PayBookingDto } from './dto/pay-booking.dto';
import { DisputePaymentDto } from './dto/dispute-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('bookings/:id/pay')
  pay(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PayBookingDto,
  ) {
    if (req.user.role !== 'customer') {
      throw new ForbiddenException('Only customers can pay for bookings');
    }
    return this.paymentsService.pay(req.user.sub, id, dto);
  }

  @Post('bookings/:id/release')
  release(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    if (req.user.role !== 'customer') {
      throw new ForbiddenException('Only customers can release payments');
    }
    return this.paymentsService.release(req.user.sub, id);
  }

  @Post('bookings/:id/dispute')
  dispute(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DisputePaymentDto,
  ) {
    if (req.user.role !== 'customer') {
      throw new ForbiddenException('Only customers can report a problem');
    }
    return this.paymentsService.dispute(req.user.sub, id, dto);
  }

  @Post('bookings/:id/refund')
  refund(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    if (req.user.role !== 'freelancer') {
      throw new ForbiddenException('Only freelancers can refund a payment');
    }
    return this.paymentsService.refundByFreelancer(req.user.sub, id);
  }

  @Get('earnings')
  earnings(@Req() req: AuthedRequest) {
    if (req.user.role !== 'freelancer') {
      throw new ForbiddenException('Only freelancers have earnings');
    }
    return this.paymentsService.earnings(req.user.sub);
  }
}
