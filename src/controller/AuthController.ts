import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
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
                res.status(400).json({
                    errors: result.array(),
                });
            }
            this.logger.debug('New request to register a user', {
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
            res.status(201).json({
                status: true,
                id: user?.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}
