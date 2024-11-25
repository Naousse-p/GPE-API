const request = require("supertest");
const startServer = require("../../../index");
const { Class } = require("../../../src/models");

let server;
let authTokenParent;
let authTokenProfessor;
let createdClassId;

describe("Conversation Get Participant Possible functional tests", () => {
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

        const classroomData = {
            classData: {
                name: "classe test",
                code: "classeAPAE",
                level: "MS"
            },
            schoolData: {
                school_type: "exist",
                schoolId: "66ec246c4119bdd149977895",
                schoolCode: "puigddaddb"
            }
        };

        const response = await request(server)
            .post("/api/classroom")
            .set('Authorization', `Bearer ${authTokenProfessor}`)
            .send(classroomData)
            .expect(201);

        createdClassId = response.body._id;
    });

    afterAll(async () => {
        if (createdClassId) {
            await Class.findByIdAndDelete(createdClassId);
        }
        await server.close();
    });

    it('should return list of parents and teachers with whom a parent can have a conversation', async () => {
        await request(server)
            .get(`/api/conversation/${createdClassId}/participant-possible`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .expect(200);
    });

    it('should exclude the current parent from the list of possible conversation participants', async () => {
        const response = await request(server)
            .get(`/api/conversation/${createdClassId}/participant-possible`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .expect(200);

        const currentParent = response.body.parents.find(p => p.firstname === "John" && p.lastname === "Doe");
        expect(currentParent).toBeUndefined();
    });

    it('should return list of parents and exclude the current professor from the list', async () => {
        const response = await request(server)
            .get(`/api/conversation/${createdClassId}/participant-possible`)
            .set('Authorization', `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body.teachers.length).toBe(0);
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .get(`/api/conversation/${createdClassId}/participant-possible`)
            .set('Authorization', `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});