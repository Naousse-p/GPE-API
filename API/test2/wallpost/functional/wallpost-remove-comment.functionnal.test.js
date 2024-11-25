const request = require("supertest");
const startServer = require("../../../index");
const { WallpostPost, WallpostComment } = require("../../../src/models");

let server;
let authToken;
let authToken2;
let PostId;
let Post2Id;
let CommentId;
let CommentId2;

describe("Wallpost delete comment functional tests", () => {
    beforeAll(async () => {
        server = await startServer();
        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinResponse2 = await request(server)
            .post("/api/auth/signin")
            .send({ email: "naispuig@gmail.com", password: "password123" })
            .expect(200);
        authToken2 = signinResponse2.body.token;

    });

    afterAll(async () => {
        if (PostId) {
            await WallpostPost.findByIdAndDelete(PostId);
        }
        if (Post2Id) {
            await WallpostPost.findByIdAndDelete(Post2Id);
        }

        await server.close();
    });


    it('should delete comment successfully', async () => {
        const postData = {
            title: 'newww post',
            text: 'evenemnt special',
            type: 'text',
            dateTimePublish: new Date().toISOString(),
            allowComments: true
        };
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/wallpost/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(postData)
            .expect(201);

        PostId = response.body._id;
        const PostID2 = response.body._id;

        const commentData = {
            content: "coloriages"
        };

        const response2 = await request(server)
            .post(`/api/wallpost/${PostID2}/comment`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(commentData)
            .expect(201);

        CommentId = response2.body._id;
        const response3 = await request(server)
            .delete(`/api/wallpost/${CommentId}/comment`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(response3.body).toHaveProperty('message');
        expect(response3.body.message).toEqual("Commentaire supprimé avec succès");
    });


    it('should return error for post id not found', async () => {
        const nonExistentId = "66d9b37aa9d514c408a88d65";
        const response = await request(server)
            .delete(`/api/wallpost/${nonExistentId}/comment`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Commentaire non trouvé');
    });


    it('should return forbidden error', async () => {
        const postData = {
            title: 'newww post',
            text: 'evenemnt special',
            type: 'text',
            dateTimePublish: new Date().toISOString(),
            allowComments: true
        };

        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/wallpost/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(postData)
            .expect(201);

        Post2Id = response.body._id;
        const PostID2 = response.body._id;

        const commentData = {
            content: "coloriages"
        };

        const response2 = await request(server)
            .post(`/api/wallpost/${PostID2}/comment`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(commentData)
            .expect(201);

        CommentId2 = response2.body._id;
        const response3 = await request(server)
            .delete(`/api/wallpost/${CommentId2}/comment`)
            .set('Authorization', `Bearer ${authToken2}`)
            .expect(403);

        expect(response3.body.error).toEqual("Vous n'avez pas la permission de supprimer ce commentaire");
    });


    it('should return unauthorized error when no token provided', async () => {
        const postId = "663e1230ced7dbc55e7dce08";
        const response = await request(server)
            .delete(`/api/wallpost/${postId}/comment`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
