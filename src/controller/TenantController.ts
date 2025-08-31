import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import TenantService from '../services/TenantService';
import { CreateTenantRequest } from '../types';
import { Logger } from 'winston';
import { Request } from 'express';
import createHttpError from 'http-errors';
export default class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        try {
            const result = validationResult(req);
            if (!result?.isEmpty()) {
                return res.status(400).json({
                    errors: result.array(),
                });
            }
            const { address, name } = req.body;
            this.logger.info('Request came for new Tenant', { name, address });
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info('Tenant', {
                name,
                address,
            });
            res.status(201).json({
                id: tenant.id,
            });
        } catch (error) {
            next(error);
        }
    }
    async all(req: CreateTenantRequest, res: Response, next: NextFunction) {
        try {
            this.logger.info('Request came to fetch all tenants');
            const tenants = await this.tenantService.getAll();
            res.status(200).json({
                tenants,
            });
        } catch (error) {
            next(error);
        }
    }
    async getTenant(
        req: CreateTenantRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const result = validationResult(req);
            if (!result?.isEmpty()) {
                return res.status(400).json({
                    errors: result.array(),
                });
            }
            const { tenantId } = req.params;
            this.logger.info('Request came to fetch all tenants');
            const tenant = await this.tenantService.getTenantById(+tenantId);
            res.status(200).json({
                tenant,
            });
        } catch (error) {
            next(error);
        }
    }
    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        //validating if the passed paramater in url is a valid interger or not.
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        this.logger.debug('Request for updating a tenant', req.body);

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });

            this.logger.info('Tenant has been updated', { id: tenantId });

            res.json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
        }
    }
    async destroy(req: Request, res: Response, next: NextFunction) {
        const { tenantId } = req.params;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info('Tenant has been deleted', {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
        }
    }
}
