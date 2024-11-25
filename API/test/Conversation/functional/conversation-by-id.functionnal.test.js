const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Conversation Get by ID functional tests', () => {
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

    it('should get conversation successfully', async () => {
        const conversationId = "66ef017e9d26a1acc70d379b";
        const response = await request(server)
            .get(`/api/conversation/${conversationId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for conversation id not found', async () => {
        const nonExistentId = "66963de98164f6bddfee6caa";
        const response = await request(server)
            .get(`/api/conversation/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Conversation not found');
    });

    it('should return forbidden error when user does not have access to the conversation', async () => {
        const conversationId = "66e2ed7fd1af41c5863b57b8";
        const response = await request(server)
            .get(`/api/conversation/${conversationId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });


    it('should return unauthorized error when no token provided', async () => {
        const conversationId = "66ef017e9d26a1acc70d379b";
        const response = await request(server)
            .get(`/api/conversation/${conversationId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });

});
