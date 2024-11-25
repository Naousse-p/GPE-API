const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Parent by class service functional tests', () => {
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

    it('should get parents by class id', async () => {
        const ClassId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/parent/class/${ClassId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for class id not found', async () => {
        const nonExistentId = "6639e89569352c2f5804423b";
        const response = await request(server)
            .get(`/api/parent/class/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Class not found');
    });

    it('should return unauthorized error when no token provided', async () => {
        const ClassId = "66eee6eaa3c7c5bfd3c2f091";

        const response = await request(server)
            .get(`/api/parent/class/${ClassId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
