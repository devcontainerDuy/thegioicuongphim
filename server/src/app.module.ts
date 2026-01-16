import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MaintenanceGuard } from './common/guards/maintenance.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { UsersModule } from './users/users.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Setting } from './settings/entities/setting.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST') || 'localhost',
        port: configService.get<number>('DATABASE_PORT') || 3306,
        username: configService.get<string>('DATABASE_USER') || 'root',
        password: configService.get<string>('DATABASE_PASSWORD') || '',
        database:
          configService.get<string>('DATABASE_NAME') ||
          configService.get<string>('DB_DATABASE') || // Support both just in case
          'thegioicuongphim',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true, // Only for development!
      }),
    }),
    AuthModule,
    MoviesModule,
    UsersModule,
    RecommendationsModule,
    AdminModule,
    SettingsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([Setting]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
  ],
})
export class AppModule {}
