const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;
let authToken2;
let schoolId = "66ec246c4119bdd149977895";

describe('Classroom by school service functional tests', () => {
    beforeAll(async () => {
        server = await startServer();
        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinResponse2 = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        authToken2 = signinResponse2.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it('should get a classroom by code', async () => {
        await request(server)
            .get(`/api/classroom/school/${schoolId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error school not found', async () => {
        const invalidSchoolId = "6639e89369352c2f5804421e"
        const response = await request(server)
            .get(`/api/classroom/school/${invalidSchoolId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);
    });

    it('should return error access denied for the user ', async () => {
        const response = await request(server)
            .get(`/api/classroom/school/${schoolId}`)
            .set('Authorization', `Bearer ${authToken2}`)
            .expect(403);

        expect(response.body.error).toBe("You are not allowed to access this school");
    });

    it('should return 403 invalid token', async () => {
        const invalideToken = "invalid token";
        const response = await request(server)
            .get(`/api/classroom/school/${schoolId}`)
            .set('Authorization', `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });


    it('should return unauthorized error when no token provided', async () => {
        const response = await request(server)
            .get(`/api/classroom/school/${schoolId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
