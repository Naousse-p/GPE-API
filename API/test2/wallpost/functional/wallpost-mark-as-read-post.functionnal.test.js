const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;
let authOtherToken;
let postId = "66f08141d0bce6f0d102afc4";

describe("Wallpost mark as read functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
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

    it("should mark the wallpost as read for the parent", async () => {
        const response = await request(server)
            .put(`/api/wallpost/${postId}/read`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty("views");
    });

    it("should return 403 if the parent does not have access to the post", async () => {
        const response = await request(server)
            .put(`/api/wallpost/${postId}/read`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(404);

        expect(response.body).toHaveProperty(
            "error",
            "Parent non trouvé"
        );
    });

    it("should return 404 if the post is not found", async () => {
        const invalidPostId = "66f08141d0bce6f0d102af00";

        const response = await request(server)
            .put(`/api/wallpost/${invalidPostId}/read`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(404);

        expect(response.body).toHaveProperty("error", "Post non trouvé");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .put(`/api/wallpost/${postId}/read`)
            .expect(401);

        expect(response.body).toHaveProperty("message", "Access token not provided");
    });
});