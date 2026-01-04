import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin/settings')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles('Admin')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @Permissions('settings.manage') // Assuming we might want granularity, or just rely on Admin role
    async getSettings() {
        return this.settingsService.findAll();
    }

    @Put()
    @Permissions('settings.manage')
    async updateSettings(@Body() data: Record<string, any>) {
        return this.settingsService.update(data);
    }
}
