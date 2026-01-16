import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getNotifications(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return { items, total, unreadCount };
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    await this.notificationRepository.update(notificationId, { isRead: true });
    return { ...notification, isRead: true };
  }

  async markAllAsRead(userId: number) {
    return this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(userId: number, notificationId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    await this.notificationRepository.delete(notificationId);
    return { success: true };
  }

  async createNotification(
    userId: number,
    data: { type: string; title: string; message: string; metadata?: any },
  ) {
    const notification = this.notificationRepository.create({
      userId,
      ...data,
    });
    return this.notificationRepository.save(notification);
  }
}
