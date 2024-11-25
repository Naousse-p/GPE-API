const request = require("supertest");
const startServer = require("../../../index");
const { Conversation } = require("../../../src/models");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let classId = '66eee6eaa3c7c5bfd3c2f091';
let participantId = '66f06f7d2ed5892242ba750a';
let conversationId;

describe("Conversation Remove Participant Service functional tests", () => {
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

        const conversationData = {
            participants: [participantId],
            title: "photocopie test jac"
        };

        const response = await request(server)
            .post(`/api/conversation/${classId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send(conversationData)
            .expect(201);
        conversationId = response.body._id
    });

    afterAll(async () => {
        if (conversationId) {
            await Conversation.findByIdAndDelete(conversationId);
        }
        await server.close();
    });

    it("should remove the participant from the conversation successfully", async () => {
        const response = await request(server)
            .delete(`/api/conversation/${conversationId}/remove-participant`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body.message).toBe("You have successfully left the conversation");
    });

    it("should return 403 if the user is not a participant of the conversation", async () => {
        const response = await request(server)
            .delete(`/api/conversation/${conversationId}/remove-participant`)
            .set("Authorization", `Bearer ${authTokenParent}`)
            .expect(403);

        expect(response.body.error).toBe("You are not a participant of this conversation");
    });

    it("should return 404 if the conversation does not exist", async () => {
        const nonExistentConversationId = "66ec390fe350388d3aa38999";

        const response = await request(server)
            .delete(`/api/conversation/${nonExistentConversationId}/remove-participant`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Conversation not found");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .delete(`/api/conversation/${conversationId}/remove-participant`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});