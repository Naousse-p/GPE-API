const request = require("supertest");
const path = require("path");
const fs = require("fs");
const startServer = require("../../../index");

let server;
let classId = "66eee6eaa3c7c5bfd3c2f091";
let studentIds = "66eeea6cc983d2cbd60d603b";

describe("Invitation generation service", () => {
    beforeAll(async () => {
        server = await startServer();
    });

    afterAll(async () => {
        const tempDir = path.join(__dirname, "../../../controllers/invitation");
        const zipFilePath = path.join(tempDir, "invitations.zip");
        if (fs.existsSync(zipFilePath)) {
            fs.unlinkSync(zipFilePath);
        }
        await server.close();
    });

    it("should generate a ZIP file with PDF invitations", async () => {
        const response = await request(server)
            .get(`/api/invitation/generate`)
            .query({
                classId: classId,
                studentIds: studentIds,
                all: false,
            })
            .expect(200);
        expect(response.header['content-type']).toBe('application/zip');
    });
});