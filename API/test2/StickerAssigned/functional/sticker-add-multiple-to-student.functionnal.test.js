const request = require("supertest");
const startServer = require("../../../index");
const { AcquiredSticker } = require("../../../src/models");

let server;
let authTokenParent;
let authTokenProfessor;
let authOtherToken;
let studentId = "66eeea6cc983d2cbd60d603b";
let stickerIds = ["66f07b1f72966f5c152e014b"]
let createdStickerIds = [];

describe("Sticker add multiple to student service functional tests", () => {
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
        for (const stickerId of createdStickerIds) {
            await AcquiredSticker.findByIdAndDelete(stickerId);
        }
        await server.close();
    });

    it("should assign multiple stickers to the student successfully", async () => {
        const response = await request(server)
            .post("/api/sticker-assign/multiple-to-student")
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send({
                studentId: studentId,
                stickersIds: stickerIds
            })
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach((acquiredSticker) => {
            createdStickerIds.push(acquiredSticker._id);
        });
    });

    it("should return 403 if the user does not have permission", async () => {
        const response = await request(server)
            .post("/api/sticker-assign/multiple-to-student")
            .set("Authorization", `Bearer ${authTokenParent}`)
            .send({
                studentId: studentId,
                stickersIds: stickerIds
            })
            .expect(403);
        expect(response.body.message).toBe("You don't have permission to access this resource");
    });

    it("should return 404 if the student does not exist", async () => {
        const nonExistentStudentId = "6639ead741fa2f105c735533";
        const response = await request(server)
            .post("/api/sticker-assign/multiple-to-student")
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send({
                studentId: nonExistentStudentId,
                stickersIds: stickerIds
            })
            .expect(404);
        expect(response.body.message).toBe("Student not found");
    });

    it("should return 404 if the sticker does not exist", async () => {
        const nonExistentStickerId = "66eeea6cc983d2cbd60d603b";
        const response = await request(server)
            .post("/api/sticker-assign/multiple-to-student")
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send({
                studentId: studentId,
                stickersIds: [nonExistentStickerId]
            })
            .expect(404);
        expect(response.body.message).toBe("Sticker not found");
    });

    it("should return 409 if the student already has the sticker", async () => {
        const response = await request(server)
            .post("/api/sticker-assign/multiple-to-student")
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send({
                studentId: studentId,
                stickersIds: stickerIds
            })
            .expect(409);
        expect(response.body.message).toBe("Student already has this sticker");
    });

    it("should return 403 if the token is invalid", async () => {
        const invalidToken = "invalid token";

        const response = await request(server)
            .post("/api/sticker-assign/multiple-to-student")
            .set("Authorization", `Bearer ${invalidToken}`)
            .send({
                studentId: studentId,
                stickersIds: stickerIds
            })
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});