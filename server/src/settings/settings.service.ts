import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  async findAll() {
    const settings = await this.settingRepository.find();
    // Convert array to object { key: value }
    return settings.reduce((acc: Record<string, any>, curr) => {
      acc[curr.key] = this.parseValue(curr.value, curr.type);
      return acc;
    }, {});
  }

  async update(settings: Record<string, any>) {
    const updates = Object.entries(settings).map(async ([key, value]) => {
      let type = 'string';
      let stringValue = String(value);

      if (typeof value === 'boolean') {
        type = 'boolean';
        stringValue = value ? 'true' : 'false';
      } else if (typeof value === 'number') {
        type = 'number';
        stringValue = String(value);
      }

      // Upsert: Create or Update if key exists
      return this.settingRepository.save({
        key,
        value: stringValue,
        type,
      });
    });

    await Promise.all(updates);
    return this.findAll();
  }

  private parseValue(value: string, type: string) {
    if (type === 'boolean') return value === 'true';
    if (type === 'number') return Number(value);
    return value;
  }
}
