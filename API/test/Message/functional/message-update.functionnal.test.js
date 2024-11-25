const request = require("supertest");
const startServer = require("../../../index");
const { Message } = require("../../../src/models");

let server;
let authToken;
let authOtherToken;
let messageId = "66ef020fc69d7861599e4650";
let conversationId = "66ef017e9d26a1acc70d379b";
let userId = "66eee6e9a3c7c5bfd3c2f08b";

describe("Message update functional tests", () => {
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

    it("should update a message successfully", async () => {
        const response = await request(server)
            .put(`/api/conversation/${conversationId}/message/${messageId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                message: "test",
            })
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty("_id", messageId);
        expect(response.body).toHaveProperty("message");
        expect(response.body.edited).toBe(true);
    });

    it("should return 404 if message is not found", async () => {
        const invalidMessageId = "66ef020fc69d7861599e9999";

        const response = await request(server)
            .put(`/api/conversation/${conversationId}/message/${invalidMessageId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                message: "test",
            })
            .expect(404);

        expect(response.body).toHaveProperty("error", "Message not found");
    });

    it("should return 403 if user does not have permission to edit the message", async () => {
        const response = await request(server)
            .put(`/api/conversation/${conversationId}/message/${messageId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .send({
                message: "unauthorized update",
            })
            .expect(403);

        expect(response.body).toHaveProperty("error", "You do not have permission to edit this message");
    });
});