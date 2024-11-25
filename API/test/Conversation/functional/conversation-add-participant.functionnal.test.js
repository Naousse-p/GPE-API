const request = require("supertest");
const startServer = require("../../../index");
const { Conversation } = require("../../../src/models");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let conversationId = "66ef017e9d26a1acc70d379b";
let participantAddToConversation;

describe("Conversation Add Participant functional tests", () => {
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
        if (participantAddToConversation) {
            await Conversation.findByIdAndUpdate(
                conversationId,
                {
                    $pull: { participants: { user: participantAddToConversation.user } }
                }
            );
        }
        await server.close();
    });

    it('should successfully add a new participant to the conversation', async () => {
        const newParticipantData = {
            participants: ["66d97f2c12abb2fb62c89c9f"]
        };

        const response = await request(server)
            .put(`/api/conversation/${conversationId}/add-participant`)
            .set('Authorization', `Bearer ${authTokenProfessor}`)
            .send(newParticipantData)
            .expect(200);
        participantAddToConversation = response.body.participants.find(p => p.user === newParticipantData.participants[0]);
        expect(response.body.participants.length).toBe(3);
    });

    it('should return 403 when the user does not have permission to access the conversation', async () => {
        const newParticipantData = {
            participants: ["66eeef498eff8f381f0cb7f3"]
        };

        const response = await request(server)
            .put(`/api/conversation/${conversationId}/add-participant`)
            .set('Authorization', `Bearer ${authOtherToken}`)
            .send(newParticipantData)
            .expect(403);

        expect(response.body.error).toBe("You don't have permission to access this resource");
    });

    it('should return 404 when the conversation does not exist', async () => {
        const nonExistentConversationId = "6639e89369352c2f5804421e";

        const newParticipantData = {
            participants: ["66eeef498eff8f381f0cb7f3"]
        };

        const response = await request(server)
            .put(`/api/conversation/${nonExistentConversationId}/add-participant`)
            .set('Authorization', `Bearer ${authTokenProfessor}`)
            .send(newParticipantData)
            .expect(404);

        expect(response.body.error).toBe("Conversation not found");
    });

    it('should return 401 when no token is provided', async () => {
        const newParticipantData = {
            participants: ["66eeef498eff8f381f0cb7f3"]
        };

        const response = await request(server)
            .put(`/api/conversation/${conversationId}/add-participant`)
            .send(newParticipantData)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });
});