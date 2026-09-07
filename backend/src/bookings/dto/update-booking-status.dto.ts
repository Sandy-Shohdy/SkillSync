import { IsIn } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsIn(['accepted', 'declined'])
  status: 'accepted' | 'declined';
}
