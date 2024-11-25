const request = require("supertest");
const startServer = require("../../../index");
const { PadletBoard } = require("../../../src/models");

let server;
let authToken;
let authTokenParent;
let createdBoardId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe('Padlet Update Board Service', () => {
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
    });

    afterAll(async () => {
        if (createdBoardId) {
            await PadletBoard.findByIdAndDelete(createdBoardId);
        }

        await server.close();
    });

    it('should successfully update the board', async () => {
        const updateData = {
            name: 'cololoriage test',
            visibleToParents: true,
            color: 'green'
        };

        const response = await request(server)
            .put(`/api/padlet/board/${createdBoardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body).toHaveProperty('_id', createdBoardId);
        expect(response.body.name).toBe(updateData.name);
        expect(response.body.visibleToParents).toBe(updateData.visibleToParents);
        expect(response.body.color).toBe(updateData.color);
    });

    it('should return 403 when the user does not have permission to update the board', async () => {
        const updateData = {
            name: 'cololoriage test',
            visibleToParents: false
        };

        const response = await request(server)
            .put(`/api/padlet/board/${createdBoardId}`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(updateData)
            .expect(403);

        expect(response.body.message).toEqual("You don't have permission");
    });

    it('should return 404 when the board does not exist', async () => {
        const noExistBoardId = "663e1230ced7dbc55e7dce08";

        const updateData = {
            name: 'cololoriage test',
            visibleToParents: false
        };

        await request(server)
            .put(`/api/padlet/board/${noExistBoardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(404);
    });

    it('should return 400 when update data is invalid', async () => {
        const invalidUpdateData = {
            visibleToParents: "dfjsdoifdsfiod",
        };

        await request(server)
            .put(`/api/padlet/board/${createdBoardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidUpdateData)
            .expect(400);
    });
});