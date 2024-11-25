const { conversation_update_service } = require("../../../src/controllers/conversation/services");
const { Conversation, User } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/models", () => ({
    Conversation: {},
    User: {},
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("conversation_update_service", () => {
    const conversationId = "valid-conversation-id";
    const userId = "valid-user-id";
    const req = { userId };

    const mockConversation = {
        _id: conversationId,
        title: "Old Title",
        participants: [{ user: userId }, { user: "other-user-id" }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the conversation successfully", async () => {
        const data = {
            title: "Updated Title",
            participants: [{ user: "valid-user-id" }, { user: "other-user-id" }, { user: "new-user-id" }],
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);
        updateItem.mockResolvedValueOnce({ ...mockConversation, title: data.title, participants: data.participants });

        const result = await conversation_update_service(conversationId, data, req);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId, "participants");
        expect(updateItem).toHaveBeenCalledWith(Conversation, conversationId, {
            title: data.title,
            participants: data.participants
        });
        expect(result).toEqual({
            ...mockConversation,
            title: data.title,
            participants: data.participants
        });
    });

    it("should throw an error if the conversation is not found", async () => {
        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(null);

        await expect(conversation_update_service(conversationId, {}, req)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw an error if the user does not have permission to update the conversation", async () => {
        const mockConversationWithoutPermission = {
            ...mockConversation,
            participants: [{ user: "other-user-id" }],
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversationWithoutPermission);

        await expect(conversation_update_service(conversationId, {}, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw an error if the conversation update fails", async () => {
        const data = { title: "Updated Title" };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);
        updateItem.mockRejectedValueOnce(new Error("Failed to update"));

        await expect(conversation_update_service(conversationId, data, req)).rejects.toEqual({
            code: 500,
            message: "Failed to update",
        });
    });
});
