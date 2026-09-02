import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  freelancerId: string;

  @IsDateString()
  date: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'time must be in HH:MM format',
  })
  time: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
