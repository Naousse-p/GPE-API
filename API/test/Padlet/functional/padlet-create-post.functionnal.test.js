const request = require("supertest");
const startServer = require("../../../index");
const { PadletBoard, PadletPost, PadletSection } = require("../../../src/models");

let server;
let authToken;
let authTokenParent;
let createdBoardId;
let createdSectionId;
let createdPostId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe('Padlet create post service', () => {
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
        if (createdSectionId) {
            await PadletSection.findByIdAndDelete(createdSectionId);
        }
        if (createdPostId) {
            await PadletPost.findByIdAndDelete(createdPostId);
        }

        await server.close();
    });

    it('should successfully create a post in a section', async () => {
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

        expect(response.body).toHaveProperty('_id');
        expect(response.body.title).toBe(postData.title);
        expect(response.body.content).toBe(postData.content);
    });

    it('should return 403 when the user does not have permission to post', async () => {
        const postData = {
            title: 'Test coloriaaage',
            content: 'coloriiiiiage collectif de fleur',
            type: 'text'
        };

        const response = await request(server)
            .post(`/api/padlet/post/${createdSectionId}`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(postData)
            .expect(403);

        expect(response.body.message).toEqual("You don't have permission");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const postData = {
            title: 'Test coloriaaage',
            content: 'coloriiiiiage collectif de fleur',
            type: 'text'
        };

        const response = await request(server)
            .post(`/api/padlet/post/${createdSectionId}`)
            .set('Authorization', `Bearer ${invalideToken}`)
            .send(postData)
            .expect(403);
        expect(response.body.message).toBe("Invalid access token");
    });

    it('should return 404 when the section does not exist', async () => {
        const noExistSectionId = "6639e89569352c2f58044230";

        const postData = {
            title: 'Test coloriaaage',
            content: 'coloriiiiiage collectif de fleur',
            type: 'text'
        };

        await request(server)
            .post(`/api/padlet/post/${noExistSectionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(postData)
            .expect(404);
    });
});