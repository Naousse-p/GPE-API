const request = require("supertest");
const startServer = require("../../../index");
const { WallpostPost, WallpostComment } = require("../../../src/models");

let server;
let authToken;
let authTokenParent;
let createdWallpostId;
let createdCommentId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe("Wallpost update comment functional tests", () => {
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

        const postData = {
            title: 'PDF des enfants',
            text: 'testtt du post pour le wall',
            type: 'text',
            allowComments: true
        };

        const walllpostResponse = await request(server)
            .post(`/api/wallpost/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(postData)
            .expect(201);

        createdWallpostId = walllpostResponse.body._id;

        const commentData = {
            content: "coloriages avec des feutres"
        };

        const commentResponse = await request(server)
            .post(`/api/wallpost/${createdWallpostId}/comment`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(commentData)
            .expect(201);

        createdCommentId = commentResponse.body._id;
    });

    afterAll(async () => {
        if (createdCommentId) {
            await WallpostComment.findByIdAndDelete(createdCommentId);
        }
        if (createdWallpostId) {
            await WallpostPost.findByIdAndDelete(createdWallpostId);
        }

        await server.close();
    });

    it('should successfully update the comment', async () => {
        const updateData = {
            content: "coloriages avec des feutres de différente couleurs"
        };

        const response = await request(server)
            .put(`/api/wallpost/${createdCommentId}/comment`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body).toHaveProperty('_id', createdCommentId);
        expect(response.body.content).toBe(updateData.content);
    });

    it('should return 403 when the user does not have permission to update the comment', async () => {
        const updateData = {
            content: "coloriages avec des feutres de différente couleurs"
        };

        const response = await request(server)
            .put(`/api/wallpost/${createdCommentId}/comment`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(updateData)
            .expect(403);

        expect(response.body.error).toBe("Vous n'avez pas la permission de modifier ce commentaire");
    });

    it('should return 404 when the comment does not exist', async () => {
        const noExistCommentId = "663e1230ced7dbc55e7dce08";

        const updateData = {
            content: "coloriages avec des feutres de différente couleurs"
        };

        await request(server)
            .put(`/api/wallpost/${noExistCommentId}/comment`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(updateData)
            .expect(404);
    });
});
