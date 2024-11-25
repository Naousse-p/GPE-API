const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenProfessor;
let authOtherToken;
let conversationId = "66ef017e9d26a1acc70d379b";

describe("Message by conversation functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

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

    it("should successfully retrieve messages for a conversation", async () => {
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/message`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return 403 if the user is not a participant in the conversation", async () => {
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/message`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.error).toBe("You are not a participant in this conversation");
    });

    it("should return 404 if the conversation does not exist", async () => {
        const nonExistentConversationId = "6639e89569352c2f58044230";

        const response = await request(server)
            .get(`/api/conversation/${nonExistentConversationId}/message`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Conversation not found");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/message`)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"

        const response = await request(server)
            .get(`/api/conversation/${conversationId}/message`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});