const request = require("supertest");
const startServer = require("../../../index");
const { PadletBoard, PadletSection } = require("../../../src/models");

let server;
let authToken;
let authTokenParent;
let createdBoardId;
let createdSectionId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe('Padlet Remove Section Service', () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);
        authToken = signinResponse.body.token;

        const parentSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);

        authTokenParent = parentSigninResponse.body.token;

        const boardData = {
            name: "test Coloriage"
        };
        const boardResponse = await request(server)
            .post(`/api/padlet/board/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(boardData)
            .expect(201);
        createdBoardId = boardResponse.body._id;

        const sectionData = {
            title: 'Test Section',
        };

        const sectionResponse = await request(server)
            .post(`/api/padlet/section/${createdBoardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(sectionData)
            .expect(201);

        createdSectionId = sectionResponse.body._id;
    });

    afterAll(async () => {
        if (createdBoardId) {
            await PadletBoard.findByIdAndDelete(createdBoardId);
        }

        await server.close();
    });

    it('should return 403 when the user does not have permission to delete the section', async () => {
        const response = await request(server)
            .delete(`/api/padlet/section/${createdSectionId}`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .expect(403);

        expect(response.body.message).toEqual("You don't have permission");
    });

    it('should successfully delete a section and its posts', async () => {
        const response = await request(server)
            .delete(`/api/padlet/section/${createdSectionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.message).toBe("Section deleted successfully");
        const sectionInDb = await PadletSection.findById(createdSectionId);
        expect(sectionInDb).toBeNull();
    });

    it('should return 404 when the section does not exist', async () => {
        await request(server)
            .delete(`/api/padlet/section/${createdSectionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);
    });
});