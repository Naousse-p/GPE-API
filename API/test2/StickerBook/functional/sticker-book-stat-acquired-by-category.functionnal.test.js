const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let studentId = "66eeea6cc983d2cbd60d603b";

describe("Sticker book stat acquired by category service functional tests", () => {
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

    it("should return acquired stickers grouped by category for the student", async () => {
        const response = await request(server)
            .get(`/api/sticker-book/stat-acquired-by-category/${studentId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body).toHaveProperty("Agir, s’exprimer, comprendre à travers l’activité physique");
    });

    it("should return 404 if the student does not exist", async () => {
        const nonExistentStudentId = "6606ac6d7eaaaeb5b0907777";

        const response = await request(server)
            .get(`/api/sticker-book/stat-acquired-by-category/${nonExistentStudentId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.message).toBe("Student not found");
    });

    it("should return 403 if the token is invalid", async () => {
        const invalidToken = "invalid token";

        const response = await request(server)
            .get(`/api/sticker-book/stat-acquired-by-category/${studentId}`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});