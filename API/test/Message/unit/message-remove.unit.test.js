const { message_remove_service } = require("../../../src/controllers/message/services");
const { Message, Conversation } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

describe("message_remove_service", () => {
    const messageId = "valid-message-id";
    const userId = "valid-user-id";
    const mockMessage = {
        _id: messageId,
        conversation: "valid-conversation-id",
        isDeleted: false,
        save: jest.fn(),
    };
    const mockConversation = {
        _id: "valid-conversation-id",
        participants: [{ user: userId }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should mark the message as deleted successfully", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockMessage);
        getItemById.mockResolvedValueOnce(mockConversation);

        const result = await message_remove_service(messageId, userId);

        expect(isIDGood).toHaveBeenCalledWith(messageId);
        expect(getItemById).toHaveBeenCalledWith(Message, messageId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, mockMessage.conversation);
        expect(mockMessage.isDeleted).toBe(true);
        expect(mockMessage.save).toHaveBeenCalled();
        expect(result).toEqual({ message: "Message marked as deleted" });
    });

    it("should throw an error if the message is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(null);

        await expect(message_remove_service(messageId, userId)).rejects.toEqual({
            code: 404,
            message: "Message not found",
        });
    });

    it("should throw an error if the user is not in the conversation", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockMessage);
        getItemById.mockResolvedValueOnce({
            _id: "valid-conversation-id",
            participants: [{ user: "other-user-id" }],
        });

        await expect(message_remove_service(messageId, userId)).rejects.toEqual({
            code: 403,
            message: "You are not a participant in this conversation",
        });
    });
});