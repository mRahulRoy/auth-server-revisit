import winston from 'winston';
import { CONFIG } from './index';

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
        serviceName: 'auth-service',
    },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            dirname: 'logs',
            filename: 'app.logs',
            level: 'info',
            silent: CONFIG.NODE_ENV === 'dev' ? true : false,
        }),
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.timestamp(),
            ),
        }),
    ],
});

export default logger;
