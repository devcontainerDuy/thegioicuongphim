import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '@/settings/entities/setting.entity';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  isRoot?: boolean;
  role?: { name: string };
}

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path || request.originalUrl; // Fallback

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
    const maintenanceSetting = await this.settingRepository.findOne({
      where: { key: 'maintenance' },
    });

    const isMaintenanceOn = maintenanceSetting?.value === 'true';

    if (!isMaintenanceOn) {
      return true;
    }

    // 3. Bypass logic if maintenance is ON

    // 3a. Check for Token Bypass (Header or Query)
    const bypassTokenHeader = request.headers['x-maintenance-token'];
    const bypassTokenQuery = request.query['x-maintenance-token'];

    // Ensure we get a single string or undefined
    const bypassToken =
      (Array.isArray(bypassTokenHeader)
        ? bypassTokenHeader[0]
        : bypassTokenHeader) ||
      (typeof bypassTokenQuery === 'string' ? bypassTokenQuery : undefined);

    if (bypassToken) {
      const tokenSetting = await this.settingRepository.findOne({
        where: { key: 'maintenance_token' },
      });
      // If token matches config, allow
      if (tokenSetting && tokenSetting.value === bypassToken) {
        return true;
      }
    }

    // 3b. Check if user is Admin/Root using JWT manually
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = this.jwtService.verify<JwtPayload>(token, {
          secret: process.env.JWT_SECRET || 'thegioicuongphim-secret-key-2026',
        });

        if (payload.isRoot || payload.role?.name === 'Admin') {
          return true;
        }
      } catch {
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
