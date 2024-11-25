const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Classroom by id service functional tests', () => {
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

    it('should get a classroom by id', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/classroom/id/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for classroom id not found', async () => {
        const nonExistentId = "66997b40c2c76bab6c7012eb";
        const response = await request(server)
            .get(`/api/classroom/id/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Classroom not found');
    });

    it('should return forbidden error when user does not have access to the classroom', async () => {
        const classId = "66eeef4a8eff8f381f0cb7fe";
        const response = await request(server)
            .get(`/api/classroom/id/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("You are not allowed to access this classroom");
    });

    it('should return forbidden error when user does not have access to the classroom', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .get(`/api/classroom/id/${classId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });

});
