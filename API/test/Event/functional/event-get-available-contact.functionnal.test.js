const request = require("supertest");
const startServer = require("../../../index");

let server;
let professorToken;
let parentToken;
let unauthorizedToken;
let classId = "66eee6eaa3c7c5bfd3c2f091";
let classId2 = '66d9b9fb107b6b96337e48e0';

describe("Event get available contacts service functional tests", () => {
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

        const signinResponse3 = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);
        unauthorizedToken = signinResponse3.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should get available contacts for professor successfully", async () => {
        await request(server)
            .get(`/api/event/available-contact/classroom/${classId}`)
            .set("Authorization", `Bearer ${professorToken}`)
            .expect(200);
    });

    it("should get available contacts for parent successfully", async () => {
        await request(server)
            .get(`/api/event/available-contact/classroom/${classId2}`)
            .set("Authorization", `Bearer ${parentToken}`)
            .expect(200);
    });

    it("should return 403 if user role is unauthorized", async () => {
        const response = await request(server)
            .get(`/api/event/available-contact/classroom/${classId}`)
            .set("Authorization", `Bearer ${unauthorizedToken}`)
            .expect(403);

        expect(response.body.error).toBe("Rôle utilisateur non autorisé");
    });
});
