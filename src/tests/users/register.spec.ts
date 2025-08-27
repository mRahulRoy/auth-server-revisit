import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../app';
import { User } from '../../entity/User';
import { AppDataSource } from '../../config/data-source';
import { Roles } from '../../constants';
import { isJwt } from './utils';
import { RefreshToken } from '../../entity/RefreshToken';

//Three AAA rules to be followed to right better test cases.
// 1- Arrange (Arrange all or some required data )
// 1- Act (write logic to handle data  )
// 1- Assert (expect the output by comparing it  )

describe('POST /auth/register', () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
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

        it('should should store refresh token in the database', async () => {
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
            const refreshTokenRepository =
                connection.getRepository(RefreshToken);
            const refreshTokens = await refreshTokenRepository.find();
            expect(refreshTokens.length).toBe(1);
            const tokens = await refreshTokenRepository
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();
            expect(tokens).toHaveLength(1);
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
        it('should store hashed pass in the database', async () => {
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
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });
        it('should return 400 if email already exists', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            // Assert
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
        it('should return access and refresh token inside a cookie', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'secret',
            };
            // Assert
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const cookies = Array.isArray(response.headers['set-cookie'])
                ? response.headers['set-cookie']
                : response.headers['set-cookie']
                  ? [response.headers['set-cookie']]
                  : [];
            let accessToken: null | string = null;
            let refreshToken: null | string = null;
            cookies.forEach((cookie: string) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(isJwt(refreshToken)).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
        });
    });
    //sad path
    describe('Fields are missing', () => {
        it('should return 400 status code if email is missing', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: '',
                password: 'secret',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //    Assert
            const connection = AppDataSource.getRepository(User);
            const user = await connection.find();
            expect(response.statusCode).toBe(400);
            expect(user?.length).toBe(0);
        });

        it('should return 400 if firstName is missing', async () => {
            const userData = {
                firstName: '',
                lastName: 'Kumar',
                email: 'rahul@gmail.com',
                password: 'secret',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //    Assert
            expect(response.statusCode).toBe(400);
        });
    });

    //formating issues
    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: ' rahul@gmail.com ',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User);
            // Assert
            await request(app).post('/auth/register').send(userData);
            const users = await userRepository.find();
            expect(users[0].email).toBe(userData.email.trim());
        });
        it('should return 400 if email is not valid', async () => {
            const userData = {
                firstName: 'Rahul',
                lastName: 'Kumar',
                email: 'rahulgmail.com',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User);
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
