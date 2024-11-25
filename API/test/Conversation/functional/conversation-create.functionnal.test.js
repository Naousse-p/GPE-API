const request = require("supertest");
const startServer = require("../../../index");
const { Conversation } = require("../../../src/models");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let classId = '66eee6eaa3c7c5bfd3c2f091'; 
let participantId = '66f06f7d2ed5892242ba750a';
let conversationId;

describe("Conversation Create Service functional tests", () => {
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
        if (conversationId) {
            await Conversation.findByIdAndDelete(conversationId);
        }
        await server.close();
    });

    it("should create a new conversation successfully", async () => {
        const conversationData = {
            participants: [participantId],
            title: "photocopie test jacfdfdfd"
        };

        const response = await request(server)
            .post(`/api/conversation/${classId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send(conversationData)
            .expect(201);

        expect(response.body.title).toBe(conversationData.title);

        conversationId = response.body._id;
    });

    it("should return 403 if the user is not allowed to create a conversation", async () => {
        const conversationData = {
            participants: [participantId],
            title: "photocopie test jac"
        };

        const response = await request(server)
            .post(`/api/conversation/${classId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .send(conversationData)
            .expect(403);

        expect(response.body.error).toBe("You are not allowed to access this classroom");
    });

    it("should return 400 if a conversation with the same participants already exists", async () => {
        const conversationData = {
            participants: [participantId],
            title: "photocopie test jac"
        };

        const response = await request(server)
            .post(`/api/conversation/${classId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send(conversationData)
            .expect(400);

        expect(response.body.error).toBe("Conversation with the same participants already exists");
    });

    it("should return 404 if the class does not exist", async () => {
        const nonExistentClassId = "664369cef09d7674f24df7c2";
        const conversationData = {
            participants: [participantId],
            title: "Nonexistent class"
        };

        const response = await request(server)
            .post(`/api/conversation/${nonExistentClassId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send(conversationData)
            .expect(404);

        expect(response.body.error).toBe("Classroom not found");
    });

    it("should return 404 if one of the participants does not exist", async () => {
        const nonExistentParticipantId = "6606ac6d7eaaaeb5b0908888";
        const conversationData = {
            participants: [nonExistentParticipantId],
            title: "Nonexistent participant"
        };

        const response = await request(server)
            .post(`/api/conversation/${classId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send(conversationData)
            .expect(404);

        expect(response.body.error).toBe("User not found");
    });
});