import 'reflect-metadata';
import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenant';
import userRouter from './routes/user';
import cookieParser from 'cookie-parser';

const app: Express = express();
app.use(cookieParser());
app.use(express.json());
app.use(
    express.static(path.join(__dirname, '../public'), { dotfiles: 'allow' }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('Welcome to the auth service');
});

app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);
app.use('/users', userRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    logger.error(err);
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    });
});
export default app;
