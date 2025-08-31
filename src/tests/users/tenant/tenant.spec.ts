import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../../constants';
import app from '../../../app';
import { AppDataSource } from '../../../config/data-source';
import { Tenant } from '../../../entity/Tenant';

describe('Testing  tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock(`http://localhost:5501`);
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        jwks.start();
        //truncate database
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterAll(async () => {
        //truncate database
        await connection.destroy();
    });
    afterEach(() => {
        jwks.stop();
    });
    //happy path
    describe('given all fields', () => {
        it('should store tenant in the databse', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });
            const tenantData = {
                name: 'test tanant',
                address: 'Sector 104',
            };
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${adminToken}`)
                .send(tenantData);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(response.statusCode).toBe(201);
            expect(tenants).toHaveLength(1);
        });
        it('should return 401 if user is not authenticated', async () => {
            const tenantData = {
                name: 'test tanant',
                address: 'Sector 104',
            };
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(response.statusCode).toBe(401);
            expect(tenants).toHaveLength(0);
        });
    });
});
