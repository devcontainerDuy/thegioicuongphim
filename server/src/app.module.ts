import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, MoviesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

