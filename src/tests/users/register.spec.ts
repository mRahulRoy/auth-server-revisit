import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../app';
import { User } from '../../entity/User';
import { AppDataSource } from '../../config/data-source';
import { Roles } from '../../constants';
//Three AAA rules to be followed to right better test cases.
// 1- Arrange (Arrange all or some required data )
// 1- Act (write logic to handle data  )
// 1- Assert (expect the output by comparing it  )

describe('POST /auth/register', () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    afterEach(async () => {
        //truncate database
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterAll(async () => {
        //truncate database
        await connection.destroy();
    });
    //happy path
    describe('Given all paths', () => {
        it('should return 201', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'secret',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            expect(response.statusCode).toBe(201);
        });
        it('should return valid json response', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'secret',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            expect(
                (response.header as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });
        it('should persist user in the database', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'se cret',
            };

            await request(app).post('/auth/register').send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
        });
        it('should return id of created user', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'se cret',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.body).toHaveProperty('id');
        });
        it('should assign customer role', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'secret',
            };

            await request(app).post('/auth/register').send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });
    });
    //sad path
    describe('Not Given all paths', () => {});
});
