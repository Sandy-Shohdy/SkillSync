import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@Req() req: AuthedRequest) {
    return this.notificationsService.findForUser(req.user.sub);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: AuthedRequest) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.sub, id);
  }
}
