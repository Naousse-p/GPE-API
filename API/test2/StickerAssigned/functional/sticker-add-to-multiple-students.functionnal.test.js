const request = require('supertest');
const startServer = require("../../../index");
const { AcquiredSticker } = require("../../../src/models");

let server;
let authToken;
let authOtherToken;
let aquiredStickerId;
let stickerId = "66f07b1f72966f5c152e014b";
let studentIds = ["66eeea6cc983d2cbd60d603b"];

describe('Sticker assign to multiple students functional tests', () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        if (aquiredStickerId) {
            await AcquiredSticker.findByIdAndDelete(aquiredStickerId);
        }
        await server.close();
    });

    it("should successfully assign sticker to multiple students", async () => {
        const response = await request(server)
            .post(`/api/sticker-assign/multiple`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                studentIds: studentIds,
                stickerId: stickerId
            })
            .expect(200);
        aquiredStickerId = response.body[0]._id;
        expect(response.body).toBeDefined();
        expect(response.body.length).toBeGreaterThan(0);

        response.body.forEach((acquiredSticker) => {
            expect(acquiredSticker).toHaveProperty('sticker', stickerId);
            expect(studentIds).toContain(acquiredSticker.student);
        });
    });

    it("should return 403 if the professor does not have access to the student", async () => {
        const response = await request(server)
            .post(`/api/sticker-assign/multiple`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .send({
                studentIds: studentIds,
                stickerId: "66f08dd95b8587b8d39c3401"
            })
            .expect(403);

        expect(response.body).toHaveProperty("message", "You don't have permission to access this resource");
    });

    it("should return 409 if the student already has the sticker", async () => {
        const response = await request(server)
            .post(`/api/sticker-assign/multiple`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                studentIds: studentIds,
                stickerId: stickerId
            })
            .expect(409);

        expect(response.body).toHaveProperty("message", "Student already has this sticker");
    });

    it("should return 404 if the sticker is not found", async () => {
        const invalidStickerId = "66f07b1f72966f5c152e0000";

        const response = await request(server)
            .post(`/api/sticker-assign/multiple`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                studentIds: studentIds,
                stickerId: invalidStickerId
            })
            .expect(404);

        expect(response.body).toHaveProperty("message", "Sticker not found");
    });
});