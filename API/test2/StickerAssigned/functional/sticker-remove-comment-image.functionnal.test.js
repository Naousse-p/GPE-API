const request = require('supertest');
const startServer = require("../../../index");
let server;
let authToken;
let authOtherToken;
let acquiredStickerId = "66f079f6cc758a6bbf2f3b62";

describe('Remove comment and image from acquired sticker functional tests', () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should remove comment and image from the acquired sticker", async () => {
        const response = await request(server)
            .delete(`/api/sticker-assign/${acquiredStickerId}/comment`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
    });

    it("should return 404 if acquired sticker is not found", async () => {
        const invalidStickerId = "66f29f8c143f4564c89d0000";

        const response = await request(server)
            .delete(`/api/sticker-assign/${invalidStickerId}/comment`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(404);

        expect(response.body).toHaveProperty("message", "Acquired sticker not found");
    });

    it("should return 403 if user does not have access to the sticker", async () => {

        const response = await request(server)
            .delete(`/api/sticker-assign/${acquiredStickerId}/comment`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("message", "You don't have permission to access this resource");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .delete(`/api/sticker-assign/${acquiredStickerId}/comment`)
            .expect(401);

        expect(response.body).toHaveProperty("message", "Access token not provided");
    });
});