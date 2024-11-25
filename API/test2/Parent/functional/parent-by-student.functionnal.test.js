const request = require('supertest');
const startServer = require("../../../index");
let server;
let authToken;
let authOtherToken;
const studentId = "66eeea6cc983d2cbd60d603b";

describe('Parent by student functional tests', () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should return parents for the given student", async () => {
        const response = await request(server)
            .get(`/api/parent/student/${studentId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
    });

    it("should return 404 if student is not found", async () => {
        const invalidStudentId = "66f070be2ed5892242ba0000";

        const response = await request(server)
            .get(`/api/parent/student/${invalidStudentId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(404);

        expect(response.body).toHaveProperty("error", "Student not found");
    });

    it("should return 403 if the user does not have permission to access the student data", async () => {
        const response = await request(server)
            .get(`/api/parent/student/${studentId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("error", "You don't have permission to access this resource");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .get(`/api/parent/student/${studentId}`)
            .expect(401);

        expect(response.body).toHaveProperty("message", "Access token not provided");
    });
});