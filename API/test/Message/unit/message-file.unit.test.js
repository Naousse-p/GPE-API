const { message_file_service } = require("../../../src/controllers/message/services");
const { Conversation, Message } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("fs");
jest.mock("path");

describe("message_file_service", () => {
    const conversationId = "valid-conversation-id";
    const messageId = "valid-message-id";
    const userId = "valid-user-id";
    const mockConversation = {
        _id: conversationId,
        participants: [{ user: userId }],
    };
    const mockMessage = {
        _id: messageId,
        source: "image.jpg",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return file buffer and extension for a valid message file", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);
        getItemById.mockResolvedValueOnce(mockMessage);

        const mockFileBuffer = Buffer.from("mock file content");

        path.join.mockReturnValue("../functional/images/image.jpg");
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockFileBuffer);
        path.extname.mockReturnValue(".jpg");

        const result = await message_file_service(conversationId, messageId, userId);
        console.log(result)
        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
        expect(getItemById).toHaveBeenCalledWith(Message, messageId);
        expect(fs.readFileSync).toHaveBeenCalledWith("../functional/images/image.jpg");
        expect(result).toEqual({
            fileBuffer: mockFileBuffer,
            extension: "image/jpeg",
        });
    });

    it("should throw an error if the message has no file", async () => {
        const messageWithoutFile = { ...mockMessage, source: null };
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);
        getItemById.mockResolvedValueOnce(messageWithoutFile);

        await expect(message_file_service(conversationId, messageId, userId)).rejects.toEqual({
            code: 404,
            message: "No file associated with this message",
        });
    });

    it("should throw an error if the user is not a participant in the conversation", async () => {
        const mockConversationWithoutUser = {
            _id: conversationId,
            participants: [{ user: "other-user-id" }],
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversationWithoutUser);

        await expect(message_file_service(conversationId, messageId, userId)).rejects.toEqual({
            code: 403,
            message: "You are not a participant in this conversation",
        });
    });

    it("should throw an error if the file does not exist", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);
        getItemById.mockResolvedValueOnce(mockMessage);
        fs.existsSync.mockReturnValue(false);

        await expect(message_file_service(conversationId, messageId, userId)).rejects.toEqual({
            code: 404,
            message: "File not found",
        });
    });

    it("should throw an error if the conversation is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(null);

        await expect(message_file_service(conversationId, messageId, userId)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw an error if the message is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);
        getItemById.mockResolvedValueOnce(null);

        await expect(message_file_service(conversationId, messageId, userId)).rejects.toEqual({
            code: 404,
            message: "Message not found",
        });
    });
});