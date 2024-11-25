const request = require("supertest");
const startServer = require("../../../index");
const path = require("path");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let studentId;

describe("Student remove service functional tests", () => {
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

        const studentData = {
            lastname: "thomas",
            firstname: "théo",
            sexe: "boy",
            birthdate: "2021-12-21",
            level: "ps",
            classId: "66eee6eaa3c7c5bfd3c2f091"
        };

        const filePath = path.join(__dirname, "images", "image.jpg");

        const studentResponse = await request(server)
            .post(`/api/student`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .field("lastname", studentData.lastname)
            .field("firstname", studentData.firstname)
            .field("sexe", studentData.sexe)
            .field("birthdate", studentData.birthdate)
            .field("level", studentData.level)
            .field("classId", studentData.classId)
            .attach("source", filePath)
            .expect(201);

        studentId = studentResponse.body._id;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should return 403 if the user does not have permission to delete the student", async () => {
        const response = await request(server)
            .delete(`/api/student/${studentId}`)
            .set("Authorization", `Bearer ${authTokenParent}`)
            .expect(403);

        expect(response.body.error).toBe("You don't have permission to access this resource");
    });

    it("should delete a student successfully", async () => {
        const response = await request(server)
            .delete(`/api/student/${studentId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body.message).toBe("Student deleted successfully");
    });

    it("should return 404 if the student does not exist", async () => {
        const response = await request(server)
            .delete(`/api/student/${studentId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Student not found");
    });

    it("should return 403 if the token is invalid", async () => {
        const invalidToken = "invalid token";

        const response = await request(server)
            .delete(`/api/student/${studentId}`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});