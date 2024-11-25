const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe("Sticker by class service functional tests", () => {
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

    it('should get stickers for a classId', async () => {
        const response = await request(server)
            .get('/api/sticker/class/66eee6eaa3c7c5bfd3c2f091')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for classId not found', async () => {
        const response = await request(server)
            .get('/api/sticker/class/663e1230ced7dbc55e7dce07')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toEqual('Class not found');
    });

    it('should return forbidden error when user has no permission', async () => {
        const otherSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        const otherAuthToken = otherSigninResponse.body.token;

        const response = await request(server)
            .get('/api/sticker/class/66eee6eaa3c7c5bfd3c2f091')
            .set('Authorization', `Bearer ${otherAuthToken}`)
            .expect(403);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });

    it('should return unauthorized error when no token is provided', async () => {
        const response = await request(server)
            .get('/api/sticker/class/66eee6eaa3c7c5bfd3c2f091')
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
