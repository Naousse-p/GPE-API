const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Conversation Get other participant functional tests', () => {
    beforeAll(async () => {
        // Démarrage du serveur
        server = await startServer();

        // Effectuer la connexion pour obtenir le token d'authentification
        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        // Stocker le token d'authentification
        authToken = signinResponse.body.token;

    });

    afterAll(async () => {
        await server.close();
    });

    it('should get conversation for other participant successfully', async () => {
        const conversationId = "66ef017e9d26a1acc70d379b";
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/other-participant`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for conversation id not found', async () => {
        const nonExistentId = "669653280d69ed0b9b667e21";
        const response = await request(server)
            .get(`/api/conversation/${nonExistentId}/other-participant`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.message).toEqual('Conversation not found');
    });

    it('should return forbidden error when user does not have access to the conversation', async () => {
        const conversationId = "66e2ed7fd1af41c5863b57b8";
        const response = await request(server)
            .get(`/api/conversation/${conversationId}/other-participant`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.message).toEqual("You don't have permission to access this resource");
    });

});
