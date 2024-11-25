const request = require("supertest");
const startServer = require("../../../index");

let server;
let validEmail = "aa@etna-alternance.net";
let verifiedEmail = "naiis@gmail.com";

describe("Resend email for account validation functional tests", () => {
    beforeAll(async () => {
        server = await startServer();
    });

    afterAll(async () => {
        await server.close();
    });

    it("should successfully resend validation email for an unverified account", async () => {
        const response = await request(server)
            .post("/api/auth/resend-email-for-validate-account")
            .send({ email: validEmail })
            .expect(200);

        expect(response.body).toHaveProperty("message", "Email sent");
    });

    it("should return 404 if the user does not exist", async () => {
        const response = await request(server)
            .post("/api/auth/resend-email-for-validate-account")
            .send({ email: "tests@test.com" })
            .expect(404);

        expect(response.body.message).toBe("User not found");
    });

    it("should return 400 if the account is already validated", async () => {
        const response = await request(server)
            .post("/api/auth/resend-email-for-validate-account")
            .send({ email: verifiedEmail })
            .expect(400);

        expect(response.body.message).toBe("Account already validated");
    });
});