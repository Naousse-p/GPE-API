const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let conversationId = '66ef017e9d26a1acc70d379b';
let messageId = '66ef020fc69d7861599e4650';

describe("Message file service functional tests", () => {
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
        await server.close();
    });

    it("should retrieve the file from the message successfully", async () => {
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/message/${messageId}/file`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.headers['content-type']).toBe("image/jpeg");
    });

    it("should return 404 if the file does not exist", async () => {
        const nonExistentConversation = "66e060d2f1fdaeaa2706dd6f";

        const response = await request(server)
            .get(`/api/conversation/${nonExistentConversation}/message/${messageId}/file`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Conversation not found");
    });

    it("should return 404 if the message does not exist", async () => {
        const otherMessageId = "66d97f2c12abb2fb62c89cad";

        const response = await request(server)
            .get(`/api/conversation/${conversationId}/message/${otherMessageId}/file`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Message not found");
    });

    it("should return 403 if the user does not have permission", async () => {
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/message/${messageId}/file`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.error).toBe("You are not a participant in this conversation");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/message/${messageId}/file`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});