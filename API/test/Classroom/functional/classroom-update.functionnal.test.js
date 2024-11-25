const request = require("supertest");
const startServer = require("../../../index");
const { School, Class } = require("../../../src/models");

let server;
let authToken;
let authToken2;
let createdSchoolId;
let createdClassId;

describe("Classroom update functional tests", () => {
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

        const classroomData = {
            classData: {
                name: "class azer",
                level: "MS",
                code: "CLASS1234567"
            },
            schoolData: {
                schoolName: "jule",
                schoolAddress: "césar rue",
                schoolPostal_code: "75001",
                schoolCity: "Paris",
                schoolCode: "azertyui",
                schoolPhone: "0123456789",
                school_type: "new"
            }
        };

        const response = await request(server)
            .post("/api/classroom")
            .set('Authorization', `Bearer ${authToken}`)
            .send(classroomData)
            .expect(201);

        createdClassId = response.body._id;
        createdSchoolId = response.body.school;
    });

    afterAll(async () => {
        if (createdClassId) {
            await Class.findByIdAndDelete(createdClassId);
        }
        if (createdSchoolId) {
            await School.findByIdAndDelete(createdSchoolId);
        }
        await server.close();
    });

    it("should update the classroom successfully", async () => {
        const updateData = {
            name: "update class",
            level: "ms"
        };

        const response = await request(server)
            .put(`/api/classroom/${createdClassId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body).toHaveProperty("_id", createdClassId.toString());
        expect(response.body.name).toBe(updateData.name);
        expect(response.body.level).toBe(updateData.level);
    });

    it("should return 404 if classroom does not exist", async () => {
        const notExistClassId = "6639e89369352c2f5804421e";

        const updateData = {
            name: "updated class"
        };

        await request(server)
            .put(`/api/classroom/${notExistClassId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(updateData)
            .expect(404);
    });

    it("should return 403 if user does not have access to the classroom", async () => {
        const otherClassId = "66eeef4a8eff8f381f0cb7fe"
        const updateData = {
            name: "Updated Class Name"
        };

        const response = await request(server)
            .put(`/api/classroom/${otherClassId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(updateData)
            .expect(403);

        expect(response.body.error).toBe("You are not allowed to access this classroom");
    });

    it("should return 400 if no data to update is provided", async () => {
        await request(server)
            .put(`/api/classroom/${createdClassId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({})
            .expect(400);
    });
});