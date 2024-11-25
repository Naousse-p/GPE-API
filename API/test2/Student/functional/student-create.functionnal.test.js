const request = require("supertest");
const startServer = require("../../../index");
const { Student } = require("../../../src/models");
const path = require("path");
const fs = require("fs");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let studentId;

describe("Student Create Service functional tests", () => {
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
        if (studentId) {
            const studentPath = path.join(__dirname, "../../../uploads/student", `${studentId}_source.jpg`);
            if (fs.existsSync(studentPath)) {
                fs.unlinkSync(studentPath);
            }
            await Student.findByIdAndDelete(studentId);
        }
        await server.close();
    });


    it("should create a student successfully", async () => {
        const studentData = {
            lastname: "thomas",
            firstname: "théo",
            sexe: "boy",
            birthdate: "2021-12-21",
            level: "ps",
            classId: "66eee6eaa3c7c5bfd3c2f091"
        };

        const filePath = path.join(__dirname, "images", "image.jpg");

        const response = await request(server)
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

        expect(response.body.lastname).toBe(studentData.lastname);
        expect(response.body.firstname).toBe(studentData.firstname);
        expect(response.body.sexe).toBe(studentData.sexe);
        expect(response.body.level).toBe(studentData.level);
        expect(response.body.class).toBe(studentData.classId);

        studentId = response.body._id;
    });

    it("should return 403 if the user does not have permission to create a student", async () => {
        const studentData = {
            lastname: "thomas",
            firstname: "théo",
            sexe: "boy",
            birthdate: "2021-12-21",
            level: "ps",
            classId: "66eee6eaa3c7c5bfd3c2f091"
        };

        const filePath = path.join(__dirname, "images", "image.jpg");

        const invalidToken = "invalidToken";

        const response = await request(server)
            .post(`/api/student`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .field("lastname", studentData.lastname)
            .field("firstname", studentData.firstname)
            .field("sexe", studentData.sexe)
            .field("birthdate", studentData.birthdate)
            .field("level", studentData.level)
            .field("classId", studentData.classId)
            .attach("source", filePath)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });

    it("should return 400 if no file is provided", async () => {
        const studentData = {
            lastname: "thomas",
            firstname: "théo",
            sexe: "boy",
            birthdate: "2021-12-21",
            level: "ps",
            classId: "66eee6eaa3c7c5bfd3c2f091"
        };

        const response = await request(server)
            .post(`/api/student`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .field("lastname", studentData.lastname)
            .field("firstname", studentData.firstname)
            .field("sexe", studentData.sexe)
            .field("birthdate", studentData.birthdate)
            .field("level", studentData.level)
            .field("classId", studentData.classId)
            .expect(400);

        expect(response.body.message).toBe("Source file is required");
    });
});