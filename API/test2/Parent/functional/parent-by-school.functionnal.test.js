const request = require('supertest');
const startServer = require("../../../index");
const { School, Parent, Student } = require('../../../src/models');

let server;
let authToken;
let authOtherToken;
let schoolId = "66ec246c4119bdd149977895";

describe('Parent by school functional tests', () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "no_data_in_parent_table@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should return parents for the given school", async () => {
        const response = await request(server)
            .get(`/api/parent/school/${schoolId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
    });

    it("should return 404 if school is not found", async () => {
        const invalidSchoolId = "66ec246c4119bdd149977891";

        const response = await request(server)
            .get(`/api/parent/school/${invalidSchoolId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(404);

        expect(response.body).toHaveProperty("message", "School not found");
    });

    it("should return 403 if the user does not have permission", async () => {
        const response = await request(server)
            .get(`/api/parent/school/${schoolId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("message", "You don't have permission to access this resource");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .get(`/api/parent/school/${schoolId}`)
            .expect(401);

        expect(response.body).toHaveProperty("message", "Access token not provided");
    });
});