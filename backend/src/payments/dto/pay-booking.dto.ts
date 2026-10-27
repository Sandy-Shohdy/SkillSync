import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class PayBookingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  cardholderName: string;

  @Matches(/^[\d ]{12,23}$/, { message: 'cardNumber must be 12–19 digits' })
  cardNumber: string;

  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'expiry must be in MM/YY format' })
  expiry: string;

  @Matches(/^\d{3,4}$/, { message: 'cvc must be 3 or 4 digits' })
  cvc: string;
}
