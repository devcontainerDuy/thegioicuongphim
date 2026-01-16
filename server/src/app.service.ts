import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './settings/entities/setting.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getSystemStatus() {
    const maintenance = await this.settingRepository.findOne({
      where: { key: 'maintenance' },
    });
    return {
      maintenance: maintenance?.value === 'true',
      message: 'System is operational',
    };
  }
}
