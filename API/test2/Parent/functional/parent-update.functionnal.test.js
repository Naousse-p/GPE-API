const request = require("supertest");
const startServer = require("../../../index");
const { Parent, Student, Class } = require("../../../src/models");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let userId;
let parentId = "66e0146afca0547d4aebf456";

describe("Parent update functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const parentSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        authTokenParent = parentSigninResponse.body.token;
        userId = parentSigninResponse.body.user._id;

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

    it("should successfully update parent information", async () => {
        const updateData = {
            phoneNumber: "0202020202"
        };

        const response = await request(server)
            .put(`/api/parent/update/${parentId}`)
            .set("Authorization", `Bearer ${authTokenParent}`)
            .send(updateData)
            .expect(200);

        expect(response.body.phoneNumber).toBe(updateData.phoneNumber);
    });

    it("should return 404 if parent is not found", async () => {
        const response = await request(server)
            .put(`/api/parent/update/${parentId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .send({
                phoneNumber: "0303030303"
            })
            .expect(404);

        expect(response.body.error).toBe("Parent not found");
    });

    it("should return 409 if the email is already used by another user", async () => {
        const response = await request(server)
            .put(`/api/parent/update/${parentId}`)
            .set("Authorization", `Bearer ${authTokenParent}`)
            .send({
                email: "roux_vincent@gmail.com",
                lastname: "Puig",
                firstname: "Anaïs",
            })
            .expect(409);

        expect(response.body.error).toBe("Email already used");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .put(`/api/parent/update/${parentId}`)
            .send({
                phoneNumber: "0303030303"
            })
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .put(`/api/parent/update/${parentId}`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .send({
                phoneNumber: "0303030303"
            })
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});