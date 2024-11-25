const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let stickerId = "66eeedf0a0a4f41a8b53dac1";

describe("Sticker update service functional tests", () => {
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
        await server.close();
    });

    it("should update a sticker successfully", async () => {
        const updateData = {
            name: "Je colle avec soin 2",
            category: "Apprendre ensemble et vivre ensemble",
        };

        const response = await request(server)
            .put(`/api/sticker/${stickerId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .field("name", updateData.name)
            .expect(200);

        expect(response.body.name).toBe(updateData.name);
    });

    it("should return 403 if the user does not have permission to update the sticker", async () => {
        const updateData = {
            name: "Je colle avec soin 2",
            category: "Apprendre ensemble et vivre ensemble",
        };

        const response = await request(server)
            .put(`/api/sticker/${stickerId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .field("name", updateData.name)
            .expect(403);

        expect(response.body.error).toBe("You don't have permission to access this resource");
    });

    it("should return 401 if no token is provided", async () => {
        const updateData = {
            name: "Je colle avec soin 2",
            category: "Apprendre ensemble et vivre ensemble",
        };

        const response = await request(server)
            .put(`/api/sticker/${stickerId}`)
            .field("name", updateData.name)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it("should return 403 invalid token", async () => {
        const invalidToken = "invalid token";
        const updateData = {
            name: "Je colle avec soin 2",
            category: "Apprendre ensemble et vivre ensemble",
        };


        const response = await request(server)
            .put(`/api/sticker/${stickerId}`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .field("name", updateData.name)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});