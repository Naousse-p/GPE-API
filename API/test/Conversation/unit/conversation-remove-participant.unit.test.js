const { conversation_remove_participant_service } = require("../../../src/controllers/conversation/services");
const { Conversation } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("conversation_remove_participant_service", () => {
    const conversationId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove a participant from the conversation", async () => {
        const mockConversation = {
            _id: conversationId,
            participants: [
                { user: userId, role: "admin" },
                { user: new mongoose.Types.ObjectId().toString(), role: "participant" },
            ],
            group: true,
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);

        const result = await conversation_remove_participant_service(conversationId, userId);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId, "participants");

        if (mockConversation.participants.length > 1) {
            expect(updateItem).toHaveBeenCalledWith(
                Conversation,
                conversationId,
                {
                    participants: [{ user: mockConversation.participants[1].user, role: "admin" }],
                    group: false,
                }
            );
        }
        expect(result).toEqual({ message: "You have successfully left the conversation" });
    });

    it("should throw an error if the conversation is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(null);

        await expect(conversation_remove_participant_service(conversationId, userId)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw an error if the user is not a participant", async () => {
        const mockConversation = {
            _id: conversationId,
            participants: [
                { user: new mongoose.Types.ObjectId().toString(), role: "admin" },
            ],
            group: true,
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);

        await expect(conversation_remove_participant_service(conversationId, userId)).rejects.toEqual({
            code: 403,
            message: "You are not a participant of this conversation",
        });
    });

    it("should throw an error if the user is the last participant", async () => {
        const mockConversation = {
            _id: conversationId,
            participants: [{ user: userId, role: "admin" }],
            group: true,
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);

        await expect(conversation_remove_participant_service(conversationId, userId)).rejects.toEqual({
            code: 403,
            message: "You cannot leave the conversation as the last participant",
        });
    });
});