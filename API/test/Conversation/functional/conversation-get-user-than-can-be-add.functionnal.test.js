const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let conversationId = "66ef017e9d26a1acc70d379b";

describe("Conversation Get Users That Can Be Added functional tests", () => {
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

    it('should successfully retrieve users that can be added to the conversation', async () => {
        await request(server)
            .get(`/api/conversation/${conversationId}/user-than-can-be-add`)
            .set('Authorization', `Bearer ${authTokenProfessor}`)
            .expect(200);
    });

    it('should exclude the current user from the list of possible participants', async () => {
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/user-than-can-be-add`)
            .set('Authorization', `Bearer ${authTokenProfessor}`)
            .expect(200);

        const currentProfessor = response.body.teachers.find(p => p.user === professorSigninResponse.body.userId);
        expect(currentProfessor).toBeUndefined();
    });

    it('should return 403 when the user does not have permission to view the conversation', async () => {
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/user-than-can-be-add`)
            .set('Authorization', `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.message).toBe("You don't have permission to access this resource");
    });

    it('should return 404 when the conversation does not exist', async () => {
        const nonExistentConversationId = "6696750758482c859b8a3635";

        const response = await request(server)
            .get(`/api/conversation/${nonExistentConversationId}/user-than-can-be-add`)
            .set('Authorization', `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.message).toBe("Conversation not found");
    });

    it('should return 401 when no token is provided', async () => {
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/user-than-can-be-add`)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/user-than-can-be-add`)
            .set('Authorization', `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});