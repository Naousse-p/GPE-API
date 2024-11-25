const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenProfessor;
let authOtherToken;
let postId = "66ef3e8df911302e0db95b70";

describe("Padlet file service functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

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

    it("should successfully retrieve a file for a valid post", async () => {
        const response = await request(server)
            .get(`/api/padlet/file/${postId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.headers["content-type"]).toBe("image/png");
    });

    it("should return 404 if the post does not exist", async () => {
        const nonExistentPostId = "603e1230ced7dbc55e7dce07";

        const response = await request(server)
            .get(`/api/padlet/file/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Post not found");
    });

    it("should return 403 if the user does not have permission to access the post", async () => {

        const response = await request(server)
            .get(`/api/padlet/file/${postId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.error).toBe("You don't have permission to access this resource");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .get(`/api/padlet/file/${postId}`)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it("should return 404 if the file does not exist on the server", async () => {
        const postIdWithNotFile = "66ef3de4a640bc47b1f81f6f";
        const response = await request(server)
            .get(`/api/padlet/file/${postIdWithNotFile}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("File not found");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"

        const response = await request(server)
            .get(`/api/padlet/file/${postId}`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});