import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable cookie parsing
  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();


