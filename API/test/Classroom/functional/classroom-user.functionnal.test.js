const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;
let authToken2;

describe('Classroom user service', () => {
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


    it('should successfully get the classrooms of a professor', async () => {
        const response = await request(server)
            .get('/api/classroom/user')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });
});
