import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'pomodoro',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
