const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let assignedStickerId = "66f079f6cc758a6bbf2f3b62";

describe("Sticker acquired add comment image service functional tests", () => {
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

    it("should add a comment and an image to the assigned sticker successfully", async () => {
        const updateData = {
            comment: "Coloriage ok ok",
        };

        const response = await request(server)
            .put(`/api/sticker-assign/${assignedStickerId}/comment`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .field("comment", updateData.comment)
            .expect(200);

        expect(response.body.comment).toBe(updateData.comment);
    });

    it("should return 403 if the user does not have permission to add a comment or image", async () => {
        const updateData = {
            comment: "Coloriage ok ok",
        };

        const response = await request(server)
            .put(`/api/sticker-assign/${assignedStickerId}/comment`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .field("comment", updateData.comment)
            .expect(403);
        expect(response.body.message).toBe("You don't have permission to access this resource");
    });

    it("should return 401 if no token is provided", async () => {
        const updateData = {
            comment: "Coloriage ok ok",
        };

        const response = await request(server)
            .put(`/api/sticker-assign/${assignedStickerId}/comment`)
            .field("comment", updateData.comment)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it("should return 403 if the token is invalid", async () => {
        const invalidToken = "invalid token";
        const updateData = {
            comment: "Coloriage ok ok",
        };

        const response = await request(server)
            .put(`/api/sticker-assign/${assignedStickerId}/comment`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .field("comment", updateData.comment)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});