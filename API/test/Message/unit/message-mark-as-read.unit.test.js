const { message_mark_as_read_service } = require("../../../src/controllers/message/services");
const { Message, Conversation } = require("../../../src/models");
const { getItemById, updateItems } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItems: jest.fn(),
}));

describe("message_mark_as_read_service", () => {
    const conversationId = "valid-conversation-id";
    const userId = "valid-user-id";
    const mockConversation = {
        _id: conversationId,
        participants: [{ user: userId, name: "John Doe" }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should mark messages as read successfully", async () => {
        getItemById.mockResolvedValueOnce(mockConversation);

        const result = await message_mark_as_read_service(conversationId, userId);

        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
        expect(updateItems).toHaveBeenCalledWith(
            Message,
            { conversation: conversationId, isRead: false, sender: { $ne: userId } },
            { isRead: true, $addToSet: { readBy: { userId, name: "John Doe" } } }
        );
        expect(result).toEqual({ message: "Messages marked as read" });
    });

    it("should throw an error if the conversation is not found", async () => {
        getItemById.mockResolvedValueOnce(null);

        await expect(message_mark_as_read_service(conversationId, userId)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw an error if the user is not a participant in the conversation", async () => {
        const mockConversationWithoutUser = {
            _id: conversationId,
            participants: [{ user: "another-user-id", name: "Jane Doe" }],
        };

        getItemById.mockResolvedValueOnce(mockConversationWithoutUser);

        await expect(message_mark_as_read_service(conversationId, userId)).rejects.toEqual({
            code: 403,
            message: "You do not have permission to mark messages as read in this conversation",
        });
    });
});