import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const settings = await this.prisma.setting.findMany();
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

            return this.prisma.setting.upsert({
                where: { key },
                update: { value: stringValue, type },
                create: { key, value: stringValue, type },
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
