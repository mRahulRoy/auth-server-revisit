import { config } from 'dotenv';
config();

export const CONFIG = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
};
