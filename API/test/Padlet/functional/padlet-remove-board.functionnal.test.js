const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Padler board remove service', () => {
    beforeAll(async () => {
        server = await startServer();

        const signinResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authToken = signinResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it('should successfully delete a board', async () => {
        const boardData = {
            name: 'Test Board ok',
        };
        const ClassId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/padlet/board/${ClassId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(boardData)
            .expect(201);

        const boardId = response.body._id;
        const response2 = await request(server)
            .delete(`/api/padlet/board/${boardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response2.body.message).toEqual('Board deleted successfully');

    });

    it('should return 403 when user does not have permission for the board', async () => {
        const boardId = "66e2e155d1af41c5863b4e1c";
        const response = await request(server)
            .delete(`/api/padlet/board/${boardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });

    it('should return 404 when board does not exist', async () => {
        const BoardId = "664ca2308882daf529e96581";
        const response = await request(server)
            .delete(`/api/padlet/board/${BoardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Board not found');
    });
});
