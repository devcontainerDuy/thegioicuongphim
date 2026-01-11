import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { path } = request;

    // 1. Always allow Admin, Auth, Status, and User Profile routes (to check identity)
    if (
      path.startsWith('/api/admin') ||
      path.startsWith('/api/auth') ||
      path.startsWith('/api/status') ||
      path.startsWith('/api/user/profile')
    ) {
      return true;
    }

    // 2. Check maintenance status
    const maintenanceSetting = await this.prisma.setting.findUnique({
      where: { key: 'maintenance' },
    });

    const isMaintenanceOn = maintenanceSetting?.value === 'true';

    if (!isMaintenanceOn) {
      return true;
    }

    // 3. Bypass logic if maintenance is ON

    // 3a. Check for Token Bypass (Header or Query)
    const bypassToken =
      request.headers['x-maintenance-token'] ||
      request.query['x-maintenance-token'];
    if (bypassToken) {
      const tokenSetting = await this.prisma.setting.findUnique({
        where: { key: 'maintenance_token' },
      });
      // If token matches config, allow
      if (tokenSetting && tokenSetting.value === bypassToken) {
        return true;
      }
    }

    // 3b. Check if user is Admin/Root using JWT manually
    // Since Global Guard runs before AuthGuard, request.user might be undefined.
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'thegioicuongphim-secret-key-2026',
        });

        // payload contains: userId, email, role (object or name?), isRoot
        // Based on JwtStrategy, it stores { ..., role: user.role, isRoot: user.isRoot }
        if (payload.isRoot || payload.role?.name === 'Admin') {
          return true;
        }
      } catch (err) {
        // Token invalid or expired, ignore and proceed to block
      }
    }

    throw new ServiceUnavailableException({
      statusCode: 503,
      message: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
      maintenance: true,
    });
  }
}
