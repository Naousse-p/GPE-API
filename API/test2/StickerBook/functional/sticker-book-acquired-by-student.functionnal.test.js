const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let studentId = "66eeea6cc983d2cbd60d603b";

describe("Sticker book acquired by student functional tests", () => {
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

    it("should retrieve acquired stickers for a student successfully", async () => {
        const response = await request(server)
            .get(`/api/sticker-book/acquired-by-student/${studentId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);
        expect(response.body).toHaveProperty("Agir, s’exprimer, comprendre à travers l’activité physique");
    });

    it("should return 403 if the user does not have permission to access the student's sticker book", async () => {
        const response = await request(server)
            .get(`/api/sticker-book/acquired-by-student/${studentId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.message).toBe("You don't have permission to access this resource");
    });

    it("should return 404 if the student is not found", async () => {
        const invalidStudentId = "6639ea1f41fa2f105c735515";

        const response = await request(server)
            .get(`/api/sticker-book/acquired-by-student/${invalidStudentId}`)
            .set("Authorization", `Bearer ${authTokenParent}`)
            .expect(404);

        expect(response.body.message).toBe("Student not found");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .get(`/api/sticker-book/acquired-by-student/${studentId}`)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it("should return 403 if the token is invalid", async () => {
        const invalidToken = "invalid token";

        const response = await request(server)
            .get(`/api/sticker-book/acquired-by-student/${studentId}`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});