const request = require("supertest");
const startServer = require("../../../index");
const { Event } = require("../../../src/models");

let server;
let authToken;
let authToken2;
let classId = "66eee6eaa3c7c5bfd3c2f091";
let createdEventId;

describe("Event create personnal service functional tests", () => {
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
    });

    afterAll(async () => {
        if (createdEventId) {
            await Event.findByIdAndDelete(createdEventId);
        }

        await server.close();
    });

    it("should create an event successfully", async () => {
        const eventData = {
            title: "Réunion de formation",
            date: "2024-10-15",
            startTime: "2024-10-15T09:00:00Z",
            endTime: "2024-10-15T11:00:00Z",
            description: "Formation sur les nouvelles méthodes pédagogiques.",
            location: "Salle 101",
            sharedWithProfessors: [
                "66432288bf287a8331ae4e47"
            ]
        };

        const response = await request(server)
            .post(`/api/event/personnal/classroom/${classId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(eventData)
            .expect(201);

        expect(response.body.event).toHaveProperty("_id");
        expect(response.body.event.title).toBe(eventData.title);

        createdEventId = response.body.event._id;
    });

    it("should return 403 if user does not have permission to create event", async () => {
        const eventData = {
            title: "Réunion de formation",
            date: "2024-10-15",
            startTime: "2024-10-15T09:00:00Z",
            endTime: "2024-10-15T11:00:00Z",
            description: "Formation sur les nouvelles méthodes pédagogiques.",
            location: "Salle 101",
            sharedWithProfessors: [
                "66432288bf287a8331ae4e47"
            ]
        };

        const response = await request(server)
            .post(`/api/event/personnal/classroom/${classId}`)
            .set("Authorization", `Bearer ${authToken2}`)
            .send(eventData)
            .expect(403);

        expect(response.body.message).toBe("You don't have permission");
    });

    it("should return 404 if class does not exist", async () => {
        const nonExistentClassId = "66432288bf287a8331ae4e47";

        const eventData = {
            title: "Réunion de formation",
            date: "2024-10-15",
            startTime: "2024-10-15T09:00:00Z",
            endTime: "2024-10-15T11:00:00Z",
            description: "Formation sur les nouvelles méthodes pédagogiques.",
            location: "Salle 101",
            sharedWithProfessors: [
                "66432288bf287a8331ae4e47"
            ]
        };

        const response = await request(server)
            .post(`/api/event/personnal/classroom/${nonExistentClassId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(eventData)
            .expect(404);
    });
});