const request = require("supertest");
const startServer = require("../../../index");
const { PadletBoard, PadletSection } = require("../../../src/models");

let server;
let authToken;
let authTokenParent;
let createdBoardId;
let createdSectionId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe('Padlet Update Section Service', () => {
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
            title: 'Test section',
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
        if (createdSectionId) {
            await PadletSection.findByIdAndDelete(createdSectionId);
        }

        await server.close();
    });

    it('should successfully update the section', async () => {
        const updateData = {
            title: 'Updated section testestset',
        };

        const response = await request(server)
            .put(`/api/padlet/section/${createdSectionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body).toHaveProperty('_id', createdSectionId);
        expect(response.body.title).toBe(updateData.title);
    });

    it('should return 403 when the user does not have permission to update the section', async () => {
        const updateData = {
            title: 'Updated section testestset',
        };

        const response = await request(server)
            .put(`/api/padlet/section/${createdSectionId}`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(updateData)
            .expect(403);

        expect(response.body.message).toEqual("You don't have permission");
    });

    it('should return 404 when the section does not exist', async () => {
        const noExistSectionId = "663e1230ced7dbc55e7dce08";

        const updateData = {
            title: 'Updated section testestset',
        };

        await request(server)
            .put(`/api/padlet/section/${noExistSectionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(404);
    });
});