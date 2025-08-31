import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { CONFIG } from './index';
import { RefreshToken } from '../entity/RefreshToken';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: CONFIG.DB_HOST,
    port: Number(CONFIG.DB_PORT),
    username: CONFIG.DB_USERNAME,
    password: String(CONFIG.DB_PASSWORD),
    database: CONFIG.DB_NAME,
    synchronize: false,
    // synchronize: CONFIG.NODE_ENV == 'test' || CONFIG.NODE_ENV == 'dev',
    logging: false,
    entities: [User, RefreshToken],
    migrations: ['src/migration/*.ts'],
    subscribers: [],
});
