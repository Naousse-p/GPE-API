const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;

describe('Padlet board by id service functional tests', () => {
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

    it('should get a padlet board by id', async () => {
        const BoardId = "66ef1aafaba59a5a2989dee0";
        const response = await request(server)
            .get(`/api/padlet/board/${BoardId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('_id', BoardId);
    });

    it('should return error for board id not found', async () => {
        const nonExistentId = "6673fa22ddcd6e82fad33e08";
        const response = await request(server)
            .get(`/api/padlet/board/${nonExistentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.error).toEqual('Board not found');
    });

    it('should return forbidden error when user does not have access to the board', async () => {
        const otherBoard = "66e2aa516220c1eda540df3c"
        const response = await request(server)
            .get(`/api/padlet/board/${otherBoard}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");

    });

    it('should return unauthorized error when no token provided', async () => {
        const BoardId = "66ef1aafaba59a5a2989dee0";
        const response = await request(server)
            .get(`/api/padlet/board/${BoardId}`)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});
