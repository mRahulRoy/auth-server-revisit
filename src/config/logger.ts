import winston from 'winston';
import { CONFIG } from '.';

const logger = winston.createLogger({
    level: CONFIG.NODE_ENV === 'dev' ? 'debug' : 'info',
    defaultMeta: { serviceName: 'auth-service' },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(), // File logs JSON format
    ),
    transports: [
        ...(CONFIG.NODE_ENV !== 'dev' && CONFIG.NODE_ENV !== 'test'
            ? [
                  new winston.transports.File({
                      dirname: 'logs',
                      filename: 'combined.log',
                      level: 'info',
                  }),
                  new winston.transports.File({
                      dirname: 'logs',
                      filename: 'error.log',
                      level: 'error',
                  }),
              ]
            : []),

        new winston.transports.Console({
            level: CONFIG.NODE_ENV === 'dev' ? 'debug' : 'info',
            silent: CONFIG.NODE_ENV === 'test',
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                winston.format.printf((info) => {
                    const { timestamp, level, message, ...meta } = info;
                    return `[${String(timestamp)}] ${level}: ${String(message)} ${
                        Object.keys(meta).length ? JSON.stringify(meta) : ''
                    }`;
                }),
            ),
        }),
    ],
});

export default logger;
