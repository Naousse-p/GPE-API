const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Student by class service functional tests', () => {
    beforeAll(async () => {
        server = await startServer();

        // Effectuer la connexion pour obtenir le token d'authentification
        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it('should get students by class successfully', async () => {
        const ClassId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/student/class/${ClassId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body[0]).toHaveProperty('class', ClassId);
    });

    it('should return error for class id not found', async () => {
        const nonExistentId = "663e1230ced7dbc55e7dce07";
        const response = await request(server)
            .get(`/api/student/class/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Class not found');
    });

    it('should return forbidden error when user does not have access to the class', async () => {
        const ClassId = "66eeef4a8eff8f381f0cb7fe";
        const response = await request(server)
            .get(`/api/student/class/${ClassId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });

    it('should return unauthorized error when no token provided', async () => {
        const ClassId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/student/class/${ClassId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
