const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;

describe("Professor update service functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const parentSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        authTokenParent = parentSigninResponse.body.token;

        const professorSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authTokenProfessor = professorSigninResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should update professor's phone number successfully", async () => {
        const updateData = { phoneNumber: "0109309029" };

        const response = await request(server)
            .put(`/api/professor`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send(updateData)
            .expect(200);

        expect(response.body.phoneNumber).toBe(updateData.phoneNumber);
        expect(response.body.lastname).toBe("prof");
    });

    it("should return 404 if the professor does not exist", async () => {
        const updateData = { phoneNumber: "0109309029" };

        const response = await request(server)
            .put(`/api/professor`)
            .set("Authorization", `Bearer ${authTokenParent}`)
            .send(updateData)
            .expect(404);

        expect(response.body.error).toBe("Professor not found");
    });

    it("should return 400 if no data is provided for update", async () => {
        const response = await request(server)
            .put(`/api/professor`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send({})
            .expect(400);

        expect(response.body.message).toBe("No data to update");
    });

    it("should return 403 if the token is invalid", async () => {
        const updateData = { phoneNumber: "0109309029" };
        const invalidToken = "invalid token";
        const response = await request(server)
            .put(`/api/professor`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .send(updateData)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});