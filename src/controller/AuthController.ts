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
        res.status(200).json({ ...user, password: undefined });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                const error = createHttpError(
                    401,
                    'User with the token could not be found',
                );
                next(error);
                return;
            }
            //persist the new refresh token record in the db
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            //deleting the old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1 hr
                httpOnly: true, //very imp
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });
            res.json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
    /*
    explanation of why we have multiple refreshToken for same user.
    Since one user can login to multiple devices so it should not be like if a user logouts from the one device it will logout that user from the other devices as well .
    so each refreshToken represents the number of devices in which user is curren;tly logged-In.
    so when a user clicks on logout , it then sends a refreshToken from the cookie to server than there server validates if this valid or not if its valid then that middlewate sets the refreshToken in the req' auth object and returns , then actul logout function gets called and from there using req.auth.id which is tokenId , we find it in db and delets it. in this way a user logsOut from that particular device.
    */

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        const { id, sub } = req.auth;
        try {
            await this.tokenService.deleteRefreshToken(Number(id));
            this.logger.info(`refresh token for userId ${sub} delete`);
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(200).json({
                id,
            });
        } catch (error) {
            next(error);
        }
    }
}
