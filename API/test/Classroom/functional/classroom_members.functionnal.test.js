
const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Classroom members service functional tests', () => {
    beforeAll(async () => {
        server = await startServer();
        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);
        authToken = signinResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it('should get members of a classId', async () => {
        const response = await request(server)
            .get('/api/classroom/members/66eee6eaa3c7c5bfd3c2f091')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for classId not found', async () => {
        const response = await request(server)
            .get('/api/classroom/members/663e1230ced7dbc55e7dcd08')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Classroom not found');
    });

    it('should return unauthorized error when no token provided', async () => {
        const response = await request(server)
            .get('/api/classroom/members/66eee6eaa3c7c5bfd3c2f091')
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });


});

