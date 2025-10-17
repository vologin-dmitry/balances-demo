import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseType } from 'typeorm';

const entities = process.env?.TYPEORM_ENTITIES?.split(',')?.map((e) =>
  e.trim(),
) || ['dist/**/*.entity.js'];

const migrations = process.env.TYPEORM_MIGRATIONS?.split(',')?.map((m) =>
  m.trim(),
) || ['dist/migrations/*.js'];

export const dataSourceOptions: DataSourceOptions = {
  type: (process.env.TYPEORM_CONNECTION as DatabaseType) || 'postgres',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: Number(process.env.TYPEORM_PORT) || 5432,
  username: process.env.TYPEORM_USERNAME || 'postgres',
  password: process.env.TYPEORM_PASSWORD || 'postgres',
  database: process.env.TYPEORM_DATABASE || 'postgres',
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities,
  migrations,
} as DataSourceOptions;

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
