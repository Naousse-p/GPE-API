const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Conversation Get for Class functional tests', () => {
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

    it('should get conversation for class successfully', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/conversation/${classId}/for-class`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for class id not found', async () => {
        const nonExistentId = "66963de98164f6bddfee6caa";
        const response = await request(server)
            .get(`/api/conversation/${nonExistentId}/for-class`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Class not found');
    });

    it('should return forbidden error when user does not have access to the class', async () => {
        const classId = "66eeef4a8eff8f381f0cb7fe";
        const response = await request(server)
            .get(`/api/conversation/${classId}/for-class`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this class");
    });


    it('should return unauthorized error when no token provided', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/conversation/${classId}/for-class`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });

});
