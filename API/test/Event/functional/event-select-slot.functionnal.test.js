const request = require("supertest");
const startServer = require("../../../index");
const { Event } = require("../../../src/models");

let server;
let parentToken;
let unauthorizedToken;
let classId = "66eee6eaa3c7c5bfd3c2f091";
let createdEventId;
let slotId;

describe("Event select slot service functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        parentToken = signinResponse.body.token;

        const signinResponse3 = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);
        unauthorizedToken = signinResponse3.body.token;

        const eventData = {
            title: "rendez vous",
            date: "2024-10-21",
            startTime: "2024-10-21T16:30:00Z",
            endTime: "2024-10-21T18:30:00Z",
            duration: 30,
            description: "Discussion sur les progrès de l'élève.",
            location: "Salle 101",
            sharedWithParents: [
                "66e0146afca0547d4aebf456"
            ]
        };
        const response = await request(server)
            .post(`/api/event/appointment/classroom/${classId}`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send(eventData)
            .expect(201);

        createdEventId = response.body.event._id;
        slotId = response.body.event.appointmentSlots[0]._id;

    });

    afterAll(async () => {
        if (createdEventId) {
            await Event.findByIdAndDelete(createdEventId);
        }

        await server.close();
    });

    it("should allow a parent to select a slot successfully", async () => {
        const response = await request(server)
            .put(`/api/event/select-slot/${createdEventId}/slot/${slotId}`)
            .set("Authorization", `Bearer ${parentToken}`)
            .expect(200);
        console.log(response.body)
        expect(response.body).toHaveProperty("_id");
    });

    it("should return 404 if event does not exist", async () => {
        const nonExistentEventId = "6696750858482c859b8a363d";

        const response = await request(server)
            .put(`/api/event/select-slot/${nonExistentEventId}/slot/${slotId}`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ slotId })
            .expect(404);
    });

    it("should return 403 if parent is not invited to the event", async () => {
        const response = await request(server)
            .put(`/api/event/select-slot/${createdEventId}/slot/${slotId}`)
            .set("Authorization", `Bearer ${unauthorizedToken}`)
            .send({ slotId })
            .expect(403);

        expect(response.body.message).toBe("You don't have permission");
    });

    it("should return 404 if slot does not exist", async () => {
        const nonExistentSlotId = "66ec246c4119bdd149977895";

        await request(server)
            .put(`/api/event/select-slot/${createdEventId}/slot/${nonExistentSlotId}`)
            .set("Authorization", `Bearer ${parentToken}`)
            .expect(404);
    });
});