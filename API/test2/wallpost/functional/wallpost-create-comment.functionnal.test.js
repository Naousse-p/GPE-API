const request = require("supertest");
const startServer = require("../../../index");
const { WallpostPost, WallpostComment } = require("../../../src/models");

let server;
let authToken;
let authToken2;
let PostId;
let Post2Id;
let Post3Id;
let CommentId;

describe("Wallpost create comment functional tests", () => {
    beforeAll(async () => {
        server = await startServer();
        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;

        const signinResponse2 = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
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
        if (Post3Id) {
            await WallpostPost.findByIdAndDelete(Post3Id);
        }
        if (CommentId) {
            await WallpostComment.findByIdAndDelete(CommentId);
        }

        await server.close();
    });


    it('should create comment successfully', async () => {
        const postData = {
            title: 'poopppp',
            text: 'pooppppdedfdf',
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

        expect(response.body.title).toBe(postData.title);
        expect(response.body.text).toBe(postData.text);
        expect(response.body.type).toBe(postData.type);
        expect(response.body.allowComments).toBe(postData.allowComments);
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

        expect(response2.body.content).toBe(commentData.content);
        CommentId = response2.body._id;

    });

    it('should return error for post id not found', async () => {
        const nonExistentId = "66b9d77ace237532a346df63";
        const response = await request(server)
            .post(`/api/wallpost/${nonExistentId}/comment`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Post non trouvé');
    });


    it('should return forbidden error', async () => {
        const postData = {
            title: 'New Post Title',
            text: 'This is the content of the post.',
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

        expect(response.body.title).toBe(postData.title);
        expect(response.body.text).toBe(postData.text);
        expect(response.body.type).toBe(postData.type);
        expect(response.body.allowComments).toBe(postData.allowComments);
        Post2Id = response.body._id;
        const PostID2 = response.body._id;

        const commentData = {
            content: "coloriages"
        };

        const response2 = await request(server)
            .post(`/api/wallpost/${PostID2}/comment`)
            .set('Authorization', `Bearer ${authToken2}`)
            .send(commentData)
            .expect(403);

        expect(response2.body.error).toEqual("Vous n'avez pas la permission de commenter ce post");
    });

    it('should return error when comment is false', async () => {
        const postData = {
            title: 'titre',
            text: 'testtert',
            type: 'text',
            dateTimePublish: new Date().toISOString(),
            allowComments: false
        };

        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/wallpost/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(postData)
            .expect(201);

        expect(response.body.allowComments).toBe(postData.allowComments);
        Post3Id = response.body._id;
        const PostID2 = response.body._id;

        const commentData = {
            content: "coloriages"
        };

        const response2 = await request(server)
            .post(`/api/wallpost/${PostID2}/comment`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(commentData)
            .expect(403);

        expect(response2.body.error).toEqual("Les commentaires ne sont pas autorisés pour ce post");
    });

    it('should return unauthorized error when no token provided', async () => {
        const postId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/wallpost/${postId}/comment`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
