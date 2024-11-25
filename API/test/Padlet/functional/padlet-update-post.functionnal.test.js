const request = require("supertest");
const startServer = require("../../../index");
const { PadletBoard, PadletSection, PadletPost } = require("../../../src/models");

let server;
let authToken;
let createdBoardId;
let authTokenParent;
let createdSectionId;
let createdPostId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe('Padlet Update Post Service', () => {
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

        const postData = {
            title: 'Test coloriaaage',
            content: 'coloriiiiiage collectif de fleur',
            type: 'text'
        };

        const response = await request(server)
            .post(`/api/padlet/post/${createdSectionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(postData)
            .expect(201);

        createdPostId = response.body._id;
    });

    afterAll(async () => {
        if (createdBoardId) {
            await PadletBoard.findByIdAndDelete(createdBoardId);
        }
        if (createdSectionId) {
            await PadletSection.findByIdAndDelete(createdSectionId);
        }
        if (createdPostId) {
            await PadletPost.findByIdAndDelete(createdPostId);
        }

        await server.close();
    });

    it('should successfully update the post content', async () => {
        const updateData = {
            title: 'test updateeeeee',
            content: 'test updateeeee posttt content',
            type: 'text'
        };

        const response = await request(server)
            .put(`/api/padlet/post/${createdPostId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body).toHaveProperty('_id', createdPostId);
        expect(response.body.title).toBe(updateData.title);
        expect(response.body.content).toBe(updateData.content);
        expect(response.body.type).toBe(updateData.type);
    });

    it('should return 403 when the user does not have permission to update the post', async () => {
        const updateData = {
            title: 'test updateeeeee',
            content: 'test updateeeee posttt content',
            type: 'text'
        };

        const response = await request(server)
            .put(`/api/padlet/post/${createdPostId}`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(updateData)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });
});