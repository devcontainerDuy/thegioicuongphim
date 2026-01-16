import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';

dotenvConfig({ path: '.env' });

export const typeOrmConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database:
    process.env.DATABASE_NAME || process.env.DB_DATABASE || 'thegioicuongphim',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  synchronize: false, // Default to false for safety
};

export const AppDataSource = new DataSource(typeOrmConfig);
