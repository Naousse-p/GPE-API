const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let conversationId = '66ef017e9d26a1acc70d379b';

describe("Message mark as read service functional tests", () => {
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

    it("should mark messages as read for a valid participant", async () => {
        const response = await request(server)
            .put(`/api/conversation/${conversationId}/message-read`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body.message).toBe("Messages marked as read");
    });

    it("should return 403 if the user is not a participant in the conversation", async () => {
        const response = await request(server)
            .put(`/api/conversation/${conversationId}/message-read`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.error).toBe("You do not have permission to mark messages as read in this conversation");
    });

    it("should return 404 if the conversation does not exist", async () => {
        const nonExistentConversationId = "66ec3ea2a16518c26dbea0f9";
        const response = await request(server)
            .put(`/api/conversation/${nonExistentConversationId}/message-read`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Conversation not found");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .put(`/api/conversation/${conversationId}/message-read`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});