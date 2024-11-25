const fs = require("fs");
const path = require("path");
const { conversation_remove_service } = require("../../../src/controllers/conversation/services");
const { Conversation, Message } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("fs");
jest.mock("../../../src/models", () => ({
    Conversation: {
        findByIdAndDelete: jest.fn(),
    },
    Message: {
        find: jest.fn(),
        deleteMany: jest.fn(),
    },
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("conversation_remove_service", () => {
    const conversationId = "valid-conversation-id";
    const userId = "admin-user-id";
    const mockConversation = {
        _id: conversationId,
        participants: [{ user: userId, role: "admin" }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove a conversation and associated messages successfully", async () => {
        const mockMessages = [
            { text: "First message" },
            { text: "Second message" },
        ];

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);
        Message.find.mockResolvedValueOnce(mockMessages);

        const result = await conversation_remove_service(conversationId, userId);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId, "participants");
        expect(Message.find).toHaveBeenCalledWith({ conversation: conversationId });
        expect(Message.deleteMany).toHaveBeenCalledWith({ conversation: conversationId });
        expect(Conversation.findByIdAndDelete).toHaveBeenCalledWith(conversationId);
        expect(result).toEqual({ message: "Conversation and associated messages deleted successfully" });
    });

    it("should throw an error if the conversation is not found", async () => {
        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(null);

        await expect(conversation_remove_service(conversationId, userId)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw an error if the user is not an admin", async () => {
        const mockNonAdminConversation = {
            ...mockConversation,
            participants: [{ user: userId, role: "participant" }],
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockNonAdminConversation);

        await expect(conversation_remove_service(conversationId, userId)).rejects.toEqual({
            code: 403,
            message: "Only admins can remove the conversation",
        });
    });
});