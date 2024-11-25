const request = require("supertest");
const startServer = require("../../../index");
const { Parent, Student } = require("../../../src/models");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let parentId = "6696750858482c859b8a363d";
let studentId = "6639eeefef8b493f38e27ef2";

describe("Parent join classroom functional tests", () => {
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
            .send({ email: "no_data_in_parent_table@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await Student.findByIdAndUpdate(
            studentId,
            {
                $pull: { parent: parentId }
            },
            { new: true } 
        );
        await Parent.findByIdAndUpdate(
            parentId,
            {
                $pull: { children: { child: studentId } }
            },
            { new: true } 
        );
        await server.close();
    });

    it("should allow parent to join classroom successfully", async () => {
        const joinClassroomData = {
            studentCode: "dda22a75",
            relationShip: "father",
        };

        const response = await request(server)
            .put("/api/parent/join-classroom")
            .set("Authorization", `Bearer ${authTokenParent}`)
            .send(joinClassroomData)
            .expect(200);

        expect(response.body.message).toBe("Parent joined classroom successfully");
    });

    it("should return 404 if student is not found", async () => {
        const invalidStudentCode = "INVALID123";

        const response = await request(server)
            .put("/api/parent/join-classroom")
            .set("Authorization", `Bearer ${authTokenParent}`)
            .send({
                studentCode: invalidStudentCode,
                relationShip: "father",
            })
            .expect(404);

        expect(response.body.message).toBe("Student not found");
    });

    it("should return 404 if parent is not found", async () => {
        const joinClassroomData = {
            studentCode: "dda22a75",
            relationShip: "father",
        };

        const response = await request(server)
            .put("/api/parent/join-classroom")
            .set("Authorization", `Bearer ${authOtherToken}`)
            .send(joinClassroomData)
            .expect(404);
        expect(response.body.message).toBe("Parent not found");
    });

    it("should return 401 if no token is provided", async () => {
        const joinClassroomData = {
            studentCode: "dda22a75",
            relationShip: "father",
        };

        const response = await request(server)
            .put("/api/parent/join-classroom")
            .send(joinClassroomData)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .put("/api/parent/join-classroom")
            .set("Authorization", `Bearer ${invalideToken}`)
            .send({
                studentCode: "dda22a75",
                relationShip: "father",
            })
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});