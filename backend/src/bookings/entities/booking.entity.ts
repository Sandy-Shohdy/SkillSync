import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum BookingType {
  APPOINTMENT = 'appointment',
  INQUIRY = 'inquiry',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: BookingType, default: BookingType.APPOINTMENT })
  type: BookingType;

  @Column({ type: 'date', nullable: true })
  date?: string;

  @Column({ nullable: true })
  time?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column()
  freelancerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'freelancerId' })
  freelancer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ type: 'int', nullable: true })
  hours?: number | null;

  // Total price in minor units (öre), fixed when the booking is created.
  @Column({ type: 'int', nullable: true })
  amount?: number | null;

  // Set when the freelancer marks the work as done; the customer then
  // releases the held payment.
  @Column({ type: 'timestamptz', nullable: true })
  workCompletedAt?: Date | null;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment?: Payment | null;

  @CreateDateColumn()
  createdAt: Date;
}
