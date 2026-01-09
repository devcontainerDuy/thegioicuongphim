import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getSystemStatus() {
    const maintenance = await this.prisma.setting.findUnique({
      where: { key: 'maintenance' },
    });
    return {
      maintenance: maintenance?.value === 'true',
      message: 'System is operational',
    };
  }
}
