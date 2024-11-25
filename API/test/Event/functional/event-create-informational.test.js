const request = require("supertest");
const startServer = require("../../../index");
const { Event } = require("../../../src/models");

let server;
let professorToken;
let parentToken;
let classId = "66eee6eaa3c7c5bfd3c2f091";
let createdEventId;

describe("Event create information service functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);
        professorToken = signinResponse.body.token;

        const signinResponse2 = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);
        parentToken = signinResponse2.body.token;
    });

    afterAll(async () => {
        if (createdEventId) {
            await Event.findByIdAndDelete(createdEventId);
        }

        await server.close();
    });

    it("should create an information event successfully", async () => {
        const eventData = {
            title: "Anniversaire de Jean",
            date: "2024-12-15",
            startTime: "2024-12-15T16:30:00Z",
            endTime: "2024-10-21T18:30:00Z",
            description: "Célébration de l'anniversaire de Jean avec des jeux et des gâteaux.",
            location: "Salle de classe 3B"
        };

        const response = await request(server)
            .post(`/api/event/informational/classroom/${classId}`)
            .set("Authorization", `Bearer ${professorToken}`)
            .send(eventData)
            .expect(201);
        expect(response.body.event.title).toBe(eventData.title);
        expect(response.body.event.eventType).toBe("informational");

        createdEventId = response.body._id;
    });

    it("should return 403 if does not exist user to create event", async () => {
        const eventData = {
            title: "Anniversaire de Jean",
            date: "2024-12-15",
            startTime: "2024-12-15T16:30:00Z",
            endTime: "2024-10-21T18:30:00Z",
            description: "Célébration de l'anniversaire de Jean avec des jeux et des gâteaux.",
            location: "Salle de classe 3B"
        };

        const response = await request(server)
            .post(`/api/event/informational/classroom/66c4ec6074309da8878c6171`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send(eventData)
            .expect(403);

        expect(response.body.message).toBe("You don't have permission");
    });

    it("should return 403 invalid token", async () => {
        const invalideToken = "invalid token";
        const eventData = {
            title: "Anniversaire de Jean",
            date: "2024-12-15",
            startTime: "2024-12-15T16:30:00Z",
            endTime: "2024-10-21T18:30:00Z",
            description: "Célébration de l'anniversaire de Jean avec des jeux et des gâteaux.",
            location: "Salle de classe 3B"
        };

        const response = await request(server)
            .post(`/api/event/informational/classroom/${classId}`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .send(eventData)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });

    it("should return 404 if class does not exist", async () => {
        const nonExistentClassId = "66432288bf287a8331ae4e47";

        const eventData = {
            title: "Anniversaire de Jean",
            date: "2024-12-15",
            startTime: "2024-12-15T16:30:00Z",
            endTime: "2024-10-21T18:30:00Z",
            description: "Célébration de l'anniversaire de Jean avec des jeux et des gâteaux.",
            location: "Salle de classe 3B"
        };

        await request(server)
            .post(`/api/event/informational/classroom/${nonExistentClassId}`)
            .set("Authorization", `Bearer ${professorToken}`)
            .send(eventData)
            .expect(404);
    });
});