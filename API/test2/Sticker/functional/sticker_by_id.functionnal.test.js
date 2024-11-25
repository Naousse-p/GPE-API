const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Sticker by id service functional tests', () => {
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

    it('should get a sticker by id', async () => {
        const StickerId = "66eeedf0a0a4f41a8b53dac1";
        const response = await request(server)
            .get(`/api/sticker/${StickerId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for sticker id not found', async () => {
        const nonExistentId = "6639e99d0565c94e484b73d8";
        const response = await request(server)
            .get(`/api/sticker/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Sticker not found');
    });

    it('should return forbidden error when user does not have access to the sticker', async () => {
        const StickerId = "66e075ab708ef03103a48548";
        const response = await request(server)
            .get(`/api/sticker/${StickerId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });

    it('should return unauthorized error when no token provided', async () => {
        const StickerId = "66eeedf0a0a4f41a8b53dac1";
        const response = await request(server)
            .get(`/api/sticker/${StickerId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
