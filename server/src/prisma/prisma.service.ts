import 'dotenv/config';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (!process.env.DATABASE_USER) {
      throw new Error('DATABASE_USER is not defined in environment variables');
    }

    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT) || 5,
    });
    super({ adapter });
  }
}
