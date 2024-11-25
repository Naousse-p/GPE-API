const request = require("supertest");
const startServer = require("../../../index");
const fs = require("fs");
const path = require("path");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let classId = "66eee6eaa3c7c5bfd3c2f091";
let stickerId;

describe("Sticker remove service functional tests", () => {
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

        const stickerData = {
            name: "je cours je saute et je lance",
            category: "Agir, s’exprimer, comprendre à travers l’activité physique"
        };

        const filePath = path.join(__dirname, "images", "image.jpg");

        const response = await request(server)
            .post(`/api/sticker`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .field("classId", classId)
            .field("name", stickerData.name)
            .field("category", stickerData.category)
            .attach("source", filePath)
            .expect(201);

        stickerId = response.body._id;
    });

    afterAll(async () => {
        if (stickerId) {
            const filePath = path.join(__dirname, "../../../uploads/sticker", `${stickerId}_source.jpg`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await server.close();
    });

    it("should return 403 if the user does not have permission to delete the sticker", async () => {
        const response = await request(server)
            .delete(`/api/sticker/${stickerId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.error).toBe("You don't have permission to access this resource");
    });

    it("should remove a sticker successfully", async () => {
        const response = await request(server)
            .delete(`/api/sticker/${stickerId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body.message).toBe("Sticker deleted successfully");
    });

    it("should return 404 if the sticker does not exist", async () => {
        const nonExistentStickerId = "663e1230ced7dbc55e7dce08";

        const response = await request(server)
            .delete(`/api/sticker/${nonExistentStickerId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Sticker not found");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .delete(`/api/sticker/${stickerId}`)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const response = await request(server)
            .delete(`/api/sticker/${stickerId}`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});