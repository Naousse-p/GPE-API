const request = require("supertest");
const startServer = require("../../../index");
const { Student, AcquiredSticker } = require("../../../src/models");

let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let server;
let studentId = "66eeea6cc983d2cbd60d603b";

describe("Sticker book service functional tests", () => {
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
            .send({ email: "naiis@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should generate a sticker book PDF for the student", async () => {
        const response = await request(server)
            .get(`/api/sticker-book/generate/${studentId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.headers['content-type']).toBe('application/pdf');
        expect(response.body).toBeDefined();
    });

    it("should return 404 if the student does not exist", async () => {
        const nonExistentStudentId = "66f071e12ed5892242ba7511";

        const response = await request(server)
            .get(`/api/sticker-book/generate/${nonExistentStudentId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.message).toBe("Student not found");
    });
});