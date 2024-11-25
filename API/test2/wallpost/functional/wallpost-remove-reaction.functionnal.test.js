const request = require("supertest");
const startServer = require("../../../index");
const { WallpostPost, WallpostReaction } = require("../../../src/models");

let server;
let authToken;
let authTokenParent;
let createdWallpostId;
let createdReactionId;
let classId = "66eee6eaa3c7c5bfd3c2f091";

describe("Wallpost remove reaction functional tests", () => {
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

        const reactionData = {
            emoji: "👍"
        };

        const reactionResponse = await request(server)
            .post(`/api/wallpost/${createdWallpostId}/reaction`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .send(reactionData)
            .expect(201);

        createdReactionId = reactionResponse.body._id;
    });

    afterAll(async () => {
        if (createdWallpostId) {
            await WallpostPost.findByIdAndDelete(createdWallpostId);
        }

        await server.close();
    });

    it('should successfully remove a reaction', async () => {
        const response = await request(server)
            .delete(`/api/wallpost/${createdReactionId}/reaction`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .expect(200);

        expect(response.body.message).toBe("Réaction supprimée avec succès");

        const reactionInDb = await WallpostReaction.findById(createdReactionId);
        expect(reactionInDb).toBeNull();
    });

    it('should return 403 when the user does not have permission to delete the reaction', async () => {
        const unauthorizedToken = "invalide token"
        await request(server)
            .delete(`/api/wallpost/${createdReactionId}/reaction`)
            .set('Authorization', `Bearer ${unauthorizedToken}`)
            .expect(403);
    });

    it('should return 403 when the professor does not have permission to delete the reaction', async () => {
        const response = await request(server)
            .delete(`/api/wallpost/${createdReactionId}/reaction`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);

            expect(response.body.message).toBe("You don't have permission");
    });

    it('should return 404 when the reaction does not exist', async () => {
        const noExistReactionId = "66eee6eaa3c7c5bfd3c2f091";

        await request(server)
            .delete(`/api/wallpost/reaction/${noExistReactionId}`)
            .set('Authorization', `Bearer ${authTokenParent}`)
            .expect(404);
    });
});
