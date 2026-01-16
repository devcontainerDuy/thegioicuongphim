import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '@/roles/entities/permission.entity';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    const user = request.user;

    // Root user bypass
    if (user?.isRoot) {
      return true;
    }

    if (!user || !user.role || !user.role.permissions) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    const userPermissions = user.role.permissions.map(
      (p: Permission) => p.slug,
    );
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Thiếu quyền truy cập: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
