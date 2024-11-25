const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenParent;
let authTokenProfessor;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe("Sticker publish acquired service functional tests", () => {
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
    });

    afterAll(async () => {
        await server.close();
    });

    it("should return stickers publish acquired", async () => {
        const response = await request(server)
            .put(`/api/sticker-assign/${classId}/publish/acquired`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 403 if the user does not have access to the student's class", async () => {
        const response = await request(server)
            .put(`/api/sticker-assign/${classId}/publish/acquired`)
            .set("Authorization", `Bearer ${authTokenParent}`)
            .expect(403);

        expect(response.body.message).toBe("You don't have permission to access this resource");
    });

    it("should return 404 if the student is not found", async () => {
        const invalidClassId = "6686b522d70c7adb7a993b7c";

        const response = await request(server)
            .put(`/api/sticker-assign/${invalidClassId}/publish/acquired`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.message).toBe("Classroom not found");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .put(`/api/sticker-assign/${classId}/publish/acquired`)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it("should return 403 if the token is invalid", async () => {
        const invalidToken = "invalid token";

        const response = await request(server)
            .put(`/api/sticker-assign/${classId}/publish/acquired`)
            .set("Authorization", `Bearer ${invalidToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});