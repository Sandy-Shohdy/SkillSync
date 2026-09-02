import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum UserRole {
  CUSTOMER = "customer",
  FREELANCER = "freelancer",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ type: "enum", enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  // Freelancer-only profile fields; left null for customers.
  @Column({ nullable: true })
  category?: string;

  @Column({ type: "int", nullable: true })
  pricePerHour?: number;

  @Column({ type: "text", array: true, nullable: true })
  skills?: string[];

  @CreateDateColumn()
  createdAt: Date;
}
