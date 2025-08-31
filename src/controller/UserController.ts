import { Response } from 'express';
import { UserService } from '../services/UserService';
import {
    CreateUserRequest,
    UpdateUserRequest,
    UserQueryParams,
} from '../types';
import { NextFunction } from 'express-serve-static-core';

import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';
import { Request } from 'express-jwt';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        //validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { firstName, lastName, email, password, tenantId, role } =
            req.body;
        try {
            this.logger.info('Request came to register user', {
                firstName,
                lastName,
                email,
                password,
                tenantId,
                role,
            });
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });
            return res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        // In our project: We are not allowing user to change the email id since it is used as username
        // In our project: We are not allowing admin user to change others password

        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { firstName, lastName, role, email, tenantId } = req.body;
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            return next(createHttpError(400, 'Invalid url param.'));
        }

        this.logger.debug('Request for updating a user', req.body);

        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
                email,
                tenantId,
            });

            this.logger.info('User has been updated', { id: userId });

            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }

    async getAll(req: CreateUserRequest, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });

        try {
            const [users, count] = await this.userService.getAll(
                validatedQuery as UserQueryParams,
            );
            res.status(200).json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }
    async getOne(req: CreateUserRequest, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const user = await this.userService.findById(Number(id));
            res.status(200).json({ user });
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            return next(createHttpError(400, 'Invalid url param.'));
        }

        try {
            await this.userService.deleteById(Number(userId));

            this.logger.info('User has been deleted', {
                id: Number(userId),
            });
            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
}
