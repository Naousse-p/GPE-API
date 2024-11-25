const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;
let authOtherToken;

describe("Parent by id functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "levevre_thomas@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should return the parent data for the authorized user", async () => {
        const response = await request(server)
            .get(`/api/parent`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
    });

    it("should return 404 if the parent is not found", async () => {
        const response = await request(server)
            .get(`/api/parent`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(404);

        expect(response.body).toHaveProperty("error", "Parent not found");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .get(`/api/parent`)
            .expect(401);

        expect(response.body).toHaveProperty("message", "Access token not provided");
    });
});