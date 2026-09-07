import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  time: string;

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

  @CreateDateColumn()
  createdAt: Date;
}
