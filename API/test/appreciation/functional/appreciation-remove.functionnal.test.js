const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;
let authToken2;
let appreciationId;

describe("Appreciation remove functional tests", () => {
    beforeAll(async () => {
        server = await startServer();
        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinResponse2 = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);
        authToken2 = signinResponse2.body.token;

        const AppreciationData = {
            appreciations: [
                {
                    content: "Participation active aux activités de groupe.",
                    date: "2024-03-20",
                    section: "ps"
                }
            ]
        };
        const studentId = "66eeea6cc983d2cbd60d603b";
        const response = await request(server)
            .post(`/api/appreciation/${studentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(AppreciationData)
            .expect(201);
        appreciationId = response.body[0]._id;

    });

    afterAll(async () => {
        await server.close();
    });

    it('should return forbidden error', async () => {
        const response = await request(server)
            .delete(`/api/appreciation/${appreciationId}`)
            .set('Authorization', `Bearer ${authToken2}`)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });

    it('should remove appreciation for student successfully', async () => {
        await request(server)
            .delete(`/api/appreciation/${appreciationId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should return error for appreciation id not found', async () => {
        const studentId = "66c89f9bf22c9fef9ac2ffb6";
        const response = await request(server)
            .delete(`/api/appreciation/${studentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Appreciation not found');
    });

    it('should return unauthorized error when no token provided', async () => {
        const studentId = "66eeea6cc983d2cbd60d603b";
        const response = await request(server)
            .delete(`/api/appreciation/${studentId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
