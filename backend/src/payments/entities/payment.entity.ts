import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum PaymentStatus {
  // Charged from the customer and held by the platform until the job is done.
  HELD = 'held',
  // Customer reported a problem; auto-release is pushed back so the
  // freelancer can respond.
  DISPUTED = 'disputed',
  RELEASED = 'released',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unique so a booking can never be charged twice.
  @Index({ unique: true })
  @Column()
  bookingId: string;

  @OneToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  customerId: string;

  @Index()
  @Column()
  freelancerId: string;

  // All amounts are in minor units (öre for SEK).
  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int' })
  platformFee: number;

  @Column({ type: 'int' })
  freelancerAmount: number;

  @Column({ default: 'SEK' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.HELD })
  status: PaymentStatus;

  @Column({ default: 'mock' })
  provider: string;

  @Column()
  providerReference: string;

  @Column({ type: 'varchar', length: 4 })
  cardLast4: string;

  @CreateDateColumn()
  createdAt: Date;

  // Set when the freelancer marks the job done. If the customer neither
  // releases nor refunds by then, the payment goes to the freelancer.
  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  autoReleaseAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  disputedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  disputeReason?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  releasedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  refundedAt?: Date | null;
}
