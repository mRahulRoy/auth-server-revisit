import request from 'supertest';
import app from '../../src/app';
//Three AAA rules to be followed to right better test cases.
// 1- Arrange (Arrange all or some required data )
// 1- Act (write logic to handle data  )
// 1- Assert (expect the output by comparing it  )

describe('POST /auth/register', () => {
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
                password: 'secret',
            };

            await request(app).post('/auth/register').send(userData);
        });
    });
    //sad path
    describe('Not Given all paths', () => {});
});
