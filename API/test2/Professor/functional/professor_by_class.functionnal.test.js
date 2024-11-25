const request = require("supertest");
const startServer = require("../../../index");
const { User, Class, Professor } = require("../../../src/models");
let server;
let authToken;

describe('Professor by class service functional tests', () => {
    let testClassId;
    let testProfessorId;

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

    it('should get professors by class id', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/professor/class/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for class id not found', async () => {
        const nonExistentId = "65688e735870c5e593b43c26";
        const response = await request(server)
            .get(`/api/professor/class/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Class not found');
    });


    it('should return unauthorized error when no token provided', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/professor/class/${classId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
