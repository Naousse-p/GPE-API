const request = require("supertest");
const startServer = require("../../../index");
const { Sticker } = require("../../../src/models");
const fs = require("fs");
const path = require("path");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let classId = "66eee6eaa3c7c5bfd3c2f091";
let stickerId;

describe("Sticker create service functional tests", () => {
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
        if (stickerId) {
            const stickerPath = path.join(__dirname, "../../../uploads/sticker", `${stickerId}_source.jpg`);
            if (fs.existsSync(stickerPath)) {
                fs.unlinkSync(stickerPath);
            }
            await Sticker.findByIdAndDelete(stickerId);
        }
        await server.close();
    });

    it("should create a sticker successfully", async () => {
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

        expect(response.body.name).toBe(stickerData.name);
        expect(response.body.description).toBe(stickerData.description);
        expect(response.body.category).toBe(stickerData.category);

        stickerId = response.body._id;
    });

    it("should return 403 if the user does not have permission to create a sticker", async () => {
        const stickerData = {
            name: "je cours je saute et je lance",
            category: "Agir, s’exprimer, comprendre à travers l’activité physique"
        };

        const filePath = path.join(__dirname, "images", "image.jpg");

        const response = await request(server)
            .post(`/api/sticker`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .field("classId", classId)
            .field("name", stickerData.name)
            .field("category", stickerData.category)
            .attach("source", filePath)
            .expect(403);

        expect(response.body.error).toBe("You don't have permission to access this resource");
    });

    it("should return 401 if no token is provided", async () => {
        const stickerData = {
            name: "je cours je saute et je lance",
            category: "Agir, s’exprimer, comprendre à travers l’activité physique"
        };


        const filePath = path.join(__dirname, "images", "image.jpg");

        const response = await request(server)
            .post(`/api/sticker`)
            .field("classId", classId)
            .field("name", stickerData.name)
            .field("category", stickerData.category)
            .attach("source", filePath)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const stickerData = {
            name: "je cours je saute et je lance",
            category: "Agir, s’exprimer, comprendre à travers l’activité physique"
        };

        const filePath = path.join(__dirname, "images", "image.jpg");

        const response = await request(server)
            .post(`/api/sticker`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .field("classId", classId)
            .field("name", stickerData.name)
            .field("category", stickerData.category)
            .attach("source", filePath)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});