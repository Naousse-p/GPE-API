const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Classroom by code service functional tests', () => {
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

    it('should get a classroom by code', async () => {
        const code = "classe5b";
        const response = await request(server)
            .get(`/api/classroom/${code}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('code', code);
        expect(response.body).toHaveProperty('name');
    });

    it('should return error for classroom code not found', async () => {
        const code = "nonExistentCode";
        const response = await request(server)
            .get(`/api/classroom/${code}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Classroom not found');
    });

    it('should return unauthorized error when no token provided', async () => {
        const code = "classe5b";
        const response = await request(server)
            .get(`/api/classroom/${code}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
