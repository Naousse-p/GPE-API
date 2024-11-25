const request = require("supertest");
const startServer = require("../../../index");

let server;
let otherToken;
let authTokenProfessor;
let postId = "66f08141d0bce6f0d102afc4";
let filename = "66f08141d0bce6f0d102afc4_0_1727037761762_source.jpg";

describe("Wallpost get file service functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const otherSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);

            otherToken = otherSigninResponse.body.token;

        const professorSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authTokenProfessor = professorSigninResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should retrieve the file from the wallpost successfully", async () => {
        const response = await request(server)
            .get(`/api/wallpost/${postId}/file/${filename}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.headers['content-type']).toBe("image/jpeg");
    });

    it("should return 404 if the file does not exist", async () => {
        const nonExistentPost = "66d97f2c12abb2fb62c89cad";

        const response = await request(server)
            .get(`/api/wallpost/${nonExistentPost}/file/${filename}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Post non trouvé");
    });

    it('should return unauthorized error when no token provided', async () => {
        const response = await request(server)
            .get(`/api/wallpost/${postId}/file/${filename}`)
            .expect(401);

        expect(response.body.message).toEqual('Access token not provided');
    });
});
