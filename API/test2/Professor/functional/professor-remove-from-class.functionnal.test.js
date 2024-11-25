const request = require("supertest");
const startServer = require("../../../index");
const { Class } = require("../../../src/models");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let professorId='66eee6e9a3c7c5bfd3c2f08b';
let classId='66eee6eaa3c7c5bfd3c2f091';

describe("Professor remove from class service functional tests", () => {
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
        await Class.findByIdAndUpdate(
            classId,
            {
                $addToSet: { professor: professorId }
            },
            { new: true }
        );
        await server.close();
    });

    it("should return 403 if the user does not have permission", async () => {
        const response = await request(server)
            .delete(`/api/professor/${professorId}/class/${classId}`)
            .set("Authorization", `Bearer ${authTokenParent}`)
            .expect(403);

        expect(response.body.error).toBe("You are not allowed to access this class");
    });

    it("should remove professor from class successfully", async () => {
        await request(server)
            .delete(`/api/professor/${professorId}/class/${classId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);
    });

    it("should return 404 if the class does not exist", async () => {
        const nonExistentClassId = "664369cef09d7674f24df7c2";

        const response = await request(server)
            .delete(`/api/professor/${professorId}/class/${nonExistentClassId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Class not found");
    });

    it("should return 404 if the professor does not exist", async () => {
        const nonExistentProfessorId = "6606ac6d7eaaaeb5b0908888";

        const response = await request(server)
            .delete(`/api/professor/${nonExistentProfessorId}/class/${classId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Professor not found");
    });

    it("should return 403 if the token is invalid", async () => {
        const invalidToken = "invalid token";
        const response = await request(server)
            .delete(`/api/professor/${professorId}/class/${classId}`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});