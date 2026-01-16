import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;

  // Enable cookie parsing
  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://api.imepartner.vn/',
      'https://thegioicuongphim-three.vercel.app',
    ],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api`);
}
bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
});
