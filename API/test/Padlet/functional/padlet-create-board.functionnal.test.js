const request = require("supertest");
const startServer = require("../../../index");
const { PadletBoard } = require("../../../src/models");

let server;
let authToken;
let createdBoardId;

describe('Padlet create board service', () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;
    });

    afterAll(async () => {
        if (createdBoardId) {
            await PadletBoard.findByIdAndDelete(createdBoardId);
        }

        await server.close();
    });

    it('should successfully create a board', async () => {
        const boardData = {
            name: 'Teest borad',
        };
        const classId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/padlet/board/${classId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(boardData)
            .expect(201);

        createdBoardId = response.body._id;

    });

    it('should return 403 when user does not have permission for the class', async () => {
        const otherClassId = "66eeef4a8eff8f381f0cb7fe"
        const boardData = {
            name: 'Teest borad',
        };

        const response = await request(server)
            .post(`/api/padlet/board/${otherClassId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(boardData)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });

    it('should return 404 when class does not exist', async () => {

        const boardData = {
            name: 'No class',
        };
        const nonExistentClassId = "663e1230ced7dbc55e7dce07";
        const response = await request(server)
            .post(`/api/padlet/board/${nonExistentClassId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(boardData)
            .expect(404);

        expect(response.body.error).toEqual('Class not found');
    });


});