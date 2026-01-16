import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.notificationsService.getNotifications(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @Put(':id/read')
  markAsRead(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, Number(id));
  }

  @Post('read-all')
  markAllAsRead(@Req() req: RequestWithUser) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  deleteNotification(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(
      req.user.id,
      Number(id),
    );
  }
}
