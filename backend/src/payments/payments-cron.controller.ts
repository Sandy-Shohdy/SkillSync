import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { PaymentsService } from './payments.service';

// Hit on a schedule (e.g. a Vercel Cron Job) so overdue payments are
// released even when nobody opens the app. Vercel sends
// `Authorization: Bearer $CRON_SECRET` automatically.
@Controller('payments')
export class PaymentsCronController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Get('auto-release')
  async autoRelease(@Headers('authorization') authorization?: string) {
    const secret = this.config.get<string>('CRON_SECRET');
    if (!secret) {
      throw new NotFoundException();
    }
    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(authorization ?? '');
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new UnauthorizedException();
    }
    const released = await this.paymentsService.releaseOverdue();
    return { released };
  }
}
