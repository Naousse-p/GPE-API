const request = require("supertest");
const startServer = require("../../../index");
const { Message } = require("../../../src/models");
const path = require("path");
const fs = require("fs");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let conversationId = '66ef017e9d26a1acc70d379b';
let messageId;

describe("Message create service functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const parentSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        authTokenParent = parentSigninResponse.body.token;

        const professorSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authTokenProfessor = professorSigninResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        if (messageId) {
            const messagePath = path.join(__dirname, "../../../uploads/message-file", `${messageId}_source.jpeg`);
            if (fs.existsSync(messagePath)) {
                fs.unlinkSync(messagePath);
            }
            await Message.findByIdAndDelete(messageId);
        }
        await server.close();
    });

    it("should create a message successfully with a file", async () => {
        const filePath = path.join(__dirname, "images", "image.jpg");

        const response = await request(server)
            .post(`/api/conversation/${conversationId}/message`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .field("content", "Ceci est un test pour le fichier !")
            .attach("source", filePath)
            .expect(201);

        expect(response.body.message).toBeDefined();
        expect(response.body.conversation).toBe(conversationId);

        messageId = response.body._id;
    });

    it("should return 403 if the user is not a participant", async () => {
        const response = await request(server)
            .post(`/api/conversation/${conversationId}/message`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .field("content", "Message de test")
            .expect(403);

        expect(response.body.error).toBe("You are not a participant in this conversation");
    });

    it("should return 404 if the conversation does not exist", async () => {
        const invalidConversationId = "66ec3eb8a16518c26dbea0fb";

        const response = await request(server)
            .post(`/api/conversation/${invalidConversationId}/message`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .field("content", "Message de test")
            .expect(404);

        expect(response.body.error).toBe("Conversation not found");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .post(`/api/conversation/${conversationId}/message`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .field("content", "Message de test")
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});