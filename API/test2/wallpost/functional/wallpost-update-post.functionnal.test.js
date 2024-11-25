const request = require("supertest");
const startServer = require("../../../index");
const { WallpostPost } = require("../../../src/models");

let server;
let authToken;
let authTokenParent;
let createdWallpostId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe("Wallpost update post functional tests", () => {
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

        await server.close();
    });

    it('should successfully update the post', async () => {
        const updateData = {
            title: "title test",
            text: "text test",
            allowComments: true,
        };

        const response = await request(server)
            .put(`/api/wallpost/${createdWallpostId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.text).toBe(updateData.text);
        expect(response.body.allowComments).toBe(updateData.allowComments);
    });

    it('should return 403 when the user does not have permission to update the post', async () => {
        const updateData = {
            title: "title test",
        };

        const response = await request(server)
            .put(`/api/wallpost/${createdWallpostId}`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(updateData)
            .expect(403);
            
        expect(response.body.message).toBe("You don't have permission");
    });

    it('should return 404 when the post does not exist', async () => {
        const noExistPostId = "663e1230ced7dbc55e7dce08";

        const updateData = {
            title: "title test",
        };

        await request(server)
            .put(`/api/wallpost/post/${noExistPostId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(404);
    });
});
