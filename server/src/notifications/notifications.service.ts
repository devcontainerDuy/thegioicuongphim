import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async getNotifications(userId: number, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        const unreadCount = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });

        return { items, total, unreadCount };
    }

    async markAsRead(userId: number, notificationId: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.userId !== userId) {
            throw new NotFoundException('Thông báo không tồn tại');
        }

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: number) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    async deleteNotification(userId: number, notificationId: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.userId !== userId) {
            throw new NotFoundException('Thông báo không tồn tại');
        }

        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }

    async createNotification(userId: number, data: { type: string, title: string, message: string, metadata?: any }) {
        return this.prisma.notification.create({
            data: {
                userId,
                ...data,
            },
        });
    }
}
