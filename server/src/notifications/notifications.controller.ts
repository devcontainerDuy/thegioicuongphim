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

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.getNotifications(
      userId,
      Number(page),
      Number(limit),
    );
  }

  @Put(':id/read')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.markAsRead(userId, Number(id));
  }

  @Post('read-all')
  markAllAsRead(@Req() req: any) {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  deleteNotification(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.deleteNotification(userId, Number(id));
  }
}
