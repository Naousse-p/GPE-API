const request = require("supertest");
const startServer = require("../../../index");
const { Message } = require("../../../src/models");

let server;
let authTokenProfessor;
let authOtherToken;
let conversationId = "66ef017e9d26a1acc70d379b";
let messageId;

describe("Message remove functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const professorSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authTokenProfessor = professorSigninResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;

        const messageData = {
            conversation: conversationId,
            message: "1d503f6307752b21500474ef264e3cb2995033f4e4f6b1f0ea44ab9a515c63db2324265acf1ec9c298a3a93fb79a998f",
            iv: "ac045c41166963c56863fd367f20335f",
            sender: professorSigninResponse.body.userId,
            senderName: "puiig nais"
        };
        const messageResponse = await Message.create(messageData);
        messageId = messageResponse._id;
    });

    afterAll(async () => {
        if (messageId) {
            await Message.findByIdAndDelete(messageId);
        }
        await server.close();
    });

    it("should mark the message as deleted successfully", async () => {
        const response = await request(server)
            .delete(`/api/conversation/${conversationId}/message/${messageId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(200);

        expect(response.body.message).toBe("Message marked as deleted");

        const deletedMessage = await Message.findById(messageId);
        expect(deletedMessage.isDeleted).toBe(true);
    });

    it("should return 404 if the message does not exist", async () => {
        const nonExistentMessageId = "6639e89569352c2f58044230";

        const response = await request(server)
            .delete(`/api/conversation/${conversationId}/message/${nonExistentMessageId}`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .expect(404);

        expect(response.body.error).toBe("Message not found");
    });

    it("should return 403 if the user is not a participant in the conversation", async () => {

        const response = await request(server)
            .delete(`/api/conversation/${conversationId}/message/${messageId}`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .expect(403);

        expect(response.body.error).toBe("You are not a participant in this conversation");
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(server)
            .delete(`/api/conversation/${conversationId}/message/${messageId}`)
            .expect(401);

        expect(response.body.message).toBe("Access token not provided");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"

        const response = await request(server)
            .delete(`/api/conversation/${conversationId}/message/${messageId}`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});