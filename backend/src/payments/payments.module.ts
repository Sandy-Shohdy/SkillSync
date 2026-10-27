import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsCronController } from './payments-cron.controller';
import { PaymentsService } from './payments.service';
import { MockPaymentProvider, PaymentProvider } from './payment-provider';
import { JwtConfigModule } from '../auth/jwt-config.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Booking]),
    JwtConfigModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController, PaymentsCronController],
  providers: [
    PaymentsService,
    { provide: PaymentProvider, useClass: MockPaymentProvider },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
