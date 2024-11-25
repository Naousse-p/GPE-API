const request = require("supertest");
const startServer = require("../../../index");
const { PadletBoard } = require("../../../src/models");

let server;
let authToken;
let createdBoardId;

describe('Padlet create section service', () => {
    beforeAll(async () => {
        server = await startServer();

        // Simuler une connexion pour obtenir un token d'authentification
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

    it('should successfully create a section', async () => {
        const boardData = {
            name: 'Test Board ok',
        };
        const ClassId = "66eee6eaa3c7c5bfd3c2f091";
        const response = await request(server)
            .post(`/api/padlet/board/${ClassId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(boardData)
            .expect(201);
        createdBoardId = response.body._id;
        const SectionId = response.body._id;
        await request(server)
            .post(`/api/padlet/section/${SectionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Test Post',
            })
            .expect(201);

    });

    it('should return 403 ', async () => {
        const otherBoard = "66e2e155d1af41c5863b4e1c";
        const response = await request(server)
            .post(`/api/padlet/section/${otherBoard}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'No Post',
            })
            .expect(403);

        expect(response.body.error).toBe("You don't have permission to access this resource");
    });

    it('should return 404 when board does not exist', async () => {
        const BoardId = "664ca2308882daf529e96581";
        const response = await request(server)
            .post(`/api/padlet/section/${BoardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Non-existent Section Post',
            })
            .expect(404);

        expect(response.body.error).toEqual('Board not found');
    });

});
