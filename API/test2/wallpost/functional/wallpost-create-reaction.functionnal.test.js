const request = require("supertest");
const startServer = require("../../../index");
const { WallpostPost, WallpostReaction } = require("../../../src/models");

let server;
let authToken;
let authTokenParent;
let createdWallpostId;
let createdReactionId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe("Wallpost create reaction functional tests", () => {
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
    });

    afterAll(async () => {
        if (createdWallpostId) {
            await WallpostPost.findByIdAndDelete(createdWallpostId);
        }
        if (createdReactionId) {
            await WallpostReaction.findByIdAndDelete(createdReactionId);
        }

        await server.close();
    });


    it('should create reaction successfully for a parent', async () => {
        const reactionData = {
            emoji: "👍"
        };

        const response = await request(server)
            .post(`/api/wallpost/${createdWallpostId}/reaction`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(reactionData)
            .expect(201);

        expect(response.body).toHaveProperty('emoji', reactionData.emoji);
        expect(response.body).toHaveProperty('parent');
        expect(response.body).toHaveProperty('post', createdWallpostId);

        createdReactionId = response.body._id;
    });

    it('should return error when a non-parent user tries to create a reaction', async () => {
        const reactionData = {
            emoji: "👍"
        };

        const response = await request(server)
            .post(`/api/wallpost/${createdWallpostId}/reaction`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(reactionData)
            .expect(403);

        expect(response.body.message).toEqual("You don't have permission");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const reactionData = {
            emoji: "👍"
        };

        const response = await request(server)
            .post(`/api/wallpost/${createdWallpostId}/reaction`)
            .set('Authorization', `Bearer ${invalideToken}`)
            .send(reactionData)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });

    it('should return error when post does not exist', async () => {
        const noExistPostId = "663e1230ced7dbc55e7dce08";

        const reactionData = {
            emoji: "👍"
        };

        await request(server)
            .post(`/api/wallpost/${noExistPostId}/reaction`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(reactionData)
            .expect(404);
    });

    it('should return error when the post is not yet published', async () => {
        const futurePostData = {
            title: 'post',
            text: 'testst despoostt',
            type: 'text',
            dateTimePublish: new Date(new Date().getTime() + 10000).toISOString(),
        };
        const futurePostResponse = await request(server)
            .post(`/api/wallpost/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(futurePostData)
            .expect(201);

        const futurePostId = futurePostResponse.body._id;

        const reactionData = {
            emoji: "👍"
        };

        await request(server)
            .post(`/api/wallpost/${futurePostId}/reaction`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(reactionData)
            .expect(403);

        await WallpostPost.findByIdAndDelete(futurePostId);
    });
});
