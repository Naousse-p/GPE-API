const request = require("supertest");
const startServer = require("../../../index");
const { Event } = require("../../../src/models");

let server;
let parentToken;
let classId = "66eee6eaa3c7c5bfd3c2f091";
let createdEventId;

describe("Event create appointement service functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);
        parentToken = signinResponse.body.token;
    });

    afterAll(async () => {
        if (createdEventId) {
            await Event.findByIdAndDelete(createdEventId);
        }

        await server.close();
    });

    it("should create an appointement event successfully", async () => {
        const eventData = {
            title: "rendez vous",
            date: "2024-10-21",
            startTime: "2024-10-21T16:30:00Z",
            endTime: "2024-10-21T18:30:00Z",
            duration: 30,
            description: "Discussion sur les progrès de l'élève.",
            location: "Salle 101",
            sharedWithParents: [
                "6639f17bef8b493f38e27f5a"
            ]
        };

        const response = await request(server)
            .post(`/api/event/appointment/classroom/${classId}`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send(eventData)
            .expect(201);

        expect(response.body.event).toHaveProperty("_id");
        expect(response.body.event.title).toBe(eventData.title);
        expect(response.body.event.eventType).toBe("appointment");

        createdEventId = response.body._id;
    });

    it("should return 403 if does not exist user to create event", async () => {
        const unauthorizedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjhhMTcxYjljZWMyNzU1M2Q3Nzc3ZCIsImlhdCI6MTcxNDU3MjY1NSwiZXhwIjoxNzE0NjU5MDU1fQ.PyoEQUS-ux-4gVPoW2DvEF2rkNyrHxo3ByRNbxc4VNx";
        const eventData = {
            title: "rendez vous",
            date: "2024-10-21",
            startTime: "2024-10-21T16:30:00Z",
            endTime: "2024-10-21T18:30:00Z",
            duration: 30,
            description: "Discussion sur les progrès de l'élève.",
            location: "Salle 101",
            sharedWithParents: [
                "6639f17bef8b493f38e27f5a"
            ]
        };

        const response = await request(server)
            .post(`/api/event/appointment/classroom/${classId}`)
            .set("Authorization", `Bearer ${unauthorizedToken}`)
            .send(eventData)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });

    it("should return 404 if class does not exist", async () => {
        const nonExistentClassId = "66432288bf287a8331ae4e47";

        const eventData = {
            title: "rendez vous",
            date: "2024-10-21",
            startTime: "2024-10-21T16:30:00Z",
            endTime: "2024-10-21T18:30:00Z",
            duration: 30,
            description: "Discussion sur les progrès de l'élève.",
            location: "Salle 101",
            sharedWithParents: [
                "6639f17bef8b493f38e27f5a"
            ]
        };

        await request(server)
            .post(`/api/event/appointment/classroom/${nonExistentClassId}`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send(eventData)
            .expect(404);
    });
});