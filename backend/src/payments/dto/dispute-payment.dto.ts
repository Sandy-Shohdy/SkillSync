import { IsString, MaxLength, MinLength } from 'class-validator';

export class DisputePaymentDto {
  @IsString()
  @MinLength(10, { message: 'Please describe the problem (at least 10 characters)' })
  @MaxLength(1000)
  reason: string;
}
