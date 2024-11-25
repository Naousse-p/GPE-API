const request = require("supertest");
const fs = require("fs");
const path = require("path");
const startServer = require("../../../index");
let server;
let authToken;

describe('Sticker picture service functional tests', () => {
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

    it('should get sticker picture successfully', async () => {
        const stickerId = "66eeedf0a0a4f41a8b53dac1";
        const response = await request(server)
            .get(`/api/sticker/${stickerId}/picture`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.headers['content-type']).toBe('image/jpeg');
    });

    it('should return error for sticker id not found', async () => {
        const nonExistentId = "6639e99d0565c94e484b73d8";
        const response = await request(server)
            .get(`/api/sticker/${nonExistentId}/picture`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Sticker not found');
    });

    it('should return unauthorized error when no token provided', async () => {
        const stickerId = "66eeedf0a0a4f41a8b53dac1";
        const response = await request(server)
            .get(`/api/sticker/${stickerId}/picture`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });

});
