const request = require('supertest');
const startServer = require("../../../index");
const { Appreciation } = require('../../../src/models');
const mongoose = require('mongoose');

let server;
let authToken;
let authToken2;
let authOtherToken;
let studentId = "66eeea6cc983d2cbd60d603b";
let appreciationIds = ['66eeae3adc4f034205adb6b'];

describe('Appreciation publish', () => {
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

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should publish appreciations for the given student", async () => {
        const response = await request(server)
            .put(`/api/appreciation/publish/${studentId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                appreciationIds: ["66eeeae3adc4f034205adb6b"]
            })
            .expect(201);

        expect(response.body).toBeDefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return 404 if studentId is invalid", async () => {
        const invalidStudentId = "66eeeae3adc4f034205adb6b";

        const response = await request(server)
            .put(`/api/appreciation/publish/${invalidStudentId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                appreciationIds: ["66eeeae3adc4f034205adb6b"]
            })
            .expect(404);

        expect(response.body).toHaveProperty("error", "Student not found");
    });

    it("should return 403 if professor does not have access to the student", async () => {
        const response = await request(server)
            .put(`/api/appreciation/publish/${studentId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .send({
                appreciationIds: ["66eeeae3adc4f034205adb6b"]
            })
            .expect(403);

        expect(response.body).toHaveProperty("error", "You don't have permission to access this resource");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .put(`/api/appreciation/publish/${studentId}`)
            .send({
                appreciationIds: ["66eeeae3adc4f034205adb6b"]
            })
            .expect(401);

        expect(response.body).toHaveProperty("message", "Access token not provided");
    });
});