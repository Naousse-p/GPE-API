const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Professor by school service functional tests', () => {
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

    it('should get professors by school id', async () => {
        const SchoolId = "66ec246c4119bdd149977895";
        const response = await request(server)
            .get(`/api/professor/school/${SchoolId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

    });

    it('should return error for school id not found', async () => {
        const nonExistentId = "6639e89369352c2f58044225";
        const response = await request(server)
            .get(`/api/professor/school/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('School not found');
    });

    it('should return forbidden error when user does not have access to the school', async () => {
        const SchoolId = "66d97f2c12abb2fb62c89ca8";
        const response = await request(server)
            .get(`/api/professor/school/${SchoolId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("You are not allowed to access this school");

    });

    it('should return unauthorized error when no token provided', async () => {
        const SchoolId = "6639e89369352c2f58044227";

        const response = await request(server)
            .get(`/api/professor/school/${SchoolId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
