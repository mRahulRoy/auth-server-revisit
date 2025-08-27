import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

import TokenService from '../services/TokenService';
import { JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialService';
import AuthRequest from '../types';
interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
interface RegisterUserRequest extends Request {
    body: UserData;
}
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { email, password, lastName, firstName } = req.body;
        try {
            const result = validationResult(req);
            if (!result?.isEmpty()) {
                return res.status(400).json({
                    errors: result.array(),
                });
            }

            this.logger.info('New request to register a user', {
                firstName,
                lastName,
                email,
            });
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User has been registered', { id: user.id });
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 60 * 60 * 60,
                httpOnly: true,
            });
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 60 * 60 * 60 * 366,
                httpOnly: true,
            });
            res.status(201).json({
                status: true,
                id: user?.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        try {
            const result = validationResult(req);
            if (!result?.isEmpty()) {
                return res.status(400).json({
                    errors: result.array(),
                });
            }

            this.logger.debug('New request to login a user', {
                email,
                password: '*******',
            });

            const user = await this.userService.findByEmail(email);

            if (!user) {
                const errorMessage = createHttpError(
                    400,
                    'Email or passwors is incorrect',
                );
                next(errorMessage);
                return;
            }

            const passwordMatched =
                await this.credentialService.comparePassword(
                    password,
                    user.password,
                );

            if (!passwordMatched) {
                const errorMessage = createHttpError(
                    400,
                    'Email or passwors is incorrect',
                );
                next(errorMessage);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 60 * 60 * 60,
                httpOnly: true,
            });
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 60 * 60 * 60 * 366,
                httpOnly: true,
            });
            res.status(200).json({
                status: true,
                id: user?.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async self(req: AuthRequest, res: Response, next: NextFunction) {
        const { sub } = req.auth;
        const user = await this.userService.findById(+sub);
        res.status(200).json(user);
    }
}
