const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Professor by id service functional tests', () => {

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

    it('should get a professor by id', async () => {
        const response = await request(server)
            .get(`/api/professor`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('_id');
    });

    it('should return unauthorized error when no token provided', async () => {
        const response = await request(server)
            .get(`/api/professor`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
