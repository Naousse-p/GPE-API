const request = require("supertest");
const startServer = require("../../../index");
const { WallpostPost } = require("../../../src/models");

let server;
let authToken;
let authToken2;
let PostId;

describe("Wallpost create post functional tests", () => {
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

        await server.close();
    });


    it('should create post successfully', async () => {
        const postData = {
            title: 'titraeee',
            text: 'testsssss',
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

    });

    it('should return error for class id not found', async () => {
        const nonExistentId = "663e1230ced7dbc55e7dce07";
        const response = await request(server)
            .post(`/api/wallpost/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Classe non trouvée');
    });

    it('should return forbidden error when user is not professor of the class', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/wallpost/${classId}`)
            .set('Authorization', `Bearer ${authToken2}`)
            .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual("You don't have permission");
    });

    it('should return unauthorized error when no token provided', async () => {
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/wallpost/${classId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
