import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from 'express';
import TenantController from '../controller/TenantController';
import tenantValidator from '../validators/tenant-validator';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';
import TenantService from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import { CreateTenantRequest } from '../types';

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) => {
        return tenantController.create(req, res, next);
    },
);

router.get(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) => {
        return tenantController.all(req, res, next);
    },
);

router.get(
    '/:tenantId',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) => {
        return tenantController.getTenant(req, res, next);
    },
);
router.patch(
    '/:tenantId',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next) as unknown as RequestHandler,
);

router.delete(
    '/:tenantId',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) => {
        return tenantController.destroy(req, res, next);
    },
);
export default router;
