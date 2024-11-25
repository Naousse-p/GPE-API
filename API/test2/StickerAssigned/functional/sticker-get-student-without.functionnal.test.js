const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let stickerId = "66eeedf0a0a4f41a8b53dac1";
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe("Sticker get students without sticker service functional tests", () => {
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

    it("should return students without the specified sticker", async () => {
        const response = await request(server)
            .get(`/api/sticker-assign/${stickerId}/class/${classId}/student/without`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
    });

    it("should return 403 if the professor does not have permission to access the sticker", async () => {
        const response = await request(server)
            .get(`/api/sticker-assign/${stickerId}/class/${classId}/student/without`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.message).toBe("You don't have permission to access this resource");
    });

    it("should return 404 if the sticker does not exist", async () => {
        const nonExistentStickerId = "6606ac6d7eaaaeb5b0907777";
        const response = await request(server)
            .get(`/api/sticker-assign/${nonExistentStickerId}/class/${classId}/student/without`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.message).toBe("Sticker not found");
    });

    it("should return 403 if the token is invalid", async () => {
        const invalidToken = "invalid token";

        const response = await request(server)
            .get(`/api/sticker-assign/${stickerId}/class/${classId}/student/without`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});