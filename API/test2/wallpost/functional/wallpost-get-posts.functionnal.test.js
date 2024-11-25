const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Wallpost get posts functional tests', () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it('should get all posts for a class', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        await request(server)
            .get(`/api/wallpost/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for class id not found', async () => {
        const noExistId = "663e1230ced7dbc55e7dce07";
        const response = await request(server)
            .get(`/api/wallpost/${noExistId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Classe non trouvée');
    });

    it('should return forbidden error when user does not have access to the class', async () => {
        const classId = "66eeef4a8eff8f381f0cb7fe";
        const response = await request(server)
            .get(`/api/wallpost/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("Vous n'avez pas la permission d'accéder à cette ressource");
    });

    it('should return unauthorized error when no token provided', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/wallpost/${classId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
