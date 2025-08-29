import { DataSource } from 'typeorm';
import request from 'supertest';

import { AppDataSource } from '../../config/data-source';
import app from '../../app';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../constants';
import { User } from '../../entity/User';

describe('POST /auth/self', () => {
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
        it('should return 200 status code', async () => {
            const accessToken = jwks.token({
                sub: '1',
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });
        it('Should return user data', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            //add token to cookie, mimiking browser auto sending cookie
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send();
            expect((response.body as Record<string, string>).id).toBe(data.id);
        });
        it('Should return 401 is token does not exists ', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User);

            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            const response = await request(app).get('/auth/self').send();

            expect(response.statusCode).toBe(401);
        });
    });
});
