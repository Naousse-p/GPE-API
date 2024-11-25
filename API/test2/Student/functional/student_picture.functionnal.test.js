const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken2;

describe('Student picture service functional tests', () => {
    beforeAll(async () => {
        server = await startServer();

        // Effectuer la connexion pour obtenir le token d'authentification
        const signinResponse2 = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        authToken2 = signinResponse2.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it('should get student picture successfully', async () => {
        const studentId = "66eeea6cc983d2cbd60d603b";
        const response = await request(server)
            .get(`/api/student/${studentId}/picture`)
            .set('Authorization', `Bearer ${authToken2}`)
            .expect(200);

        expect(response.headers['content-type']).toEqual(expect.stringContaining('image'));
        expect(response.body).toBeInstanceOf(Buffer);
    });

    it('should return error for student id not found', async () => {
        const nonExistentId = "6639ed3741fa2f105c73556c";
        const response = await request(server)
            .get(`/api/student/${nonExistentId}/picture`)
            .set('Authorization', `Bearer ${authToken2}`)
            .expect(404);

        expect(response.body.error).toEqual('Student not found');
    });

    it('should return forbidden error when user does not have access to the student', async () => {
        const studentId = "66dfffb1385e06dab1d7d112";
        const response = await request(server)
            .get(`/api/student/${studentId}/picture`)
            .set('Authorization', `Bearer ${authToken2}`)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });

    it('should return unauthorized error when no token provided', async () => {
        const studentId = "6639ed3741fa2f105c73557c";
        const response = await request(server)
            .get(`/api/student/${studentId}/picture`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
