const { message_by_conversation_service } = require("../../../src/controllers/message/services");
const { Message, Conversation } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById, getItems } = require("../../../src/utils/db-generic-services.utils");
const { decrypt } = require("../../../src/controllers/message/helpers/encrypt-decrypt.helper");

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/controllers/message/helpers/encrypt-decrypt.helper", () => ({
    decrypt: jest.fn(),
}));

describe("message_by_conversation_service", () => {
    const conversationId = "valid-conversation-id";
    const userId = "valid-user-id";

    const mockConversation = {
        _id: conversationId,
        participants: [{ user: "valid-user-id" }, { user: "other-user-id" }],
    };

    const mockMessages = [
        {
            _id: "message-id-1",
            sender: "valid-user-id",
            message: "encrypted-message-1",
            iv: "iv-1",
            toObject: jest.fn().mockReturnValue({ _id: "message-id-1", message: "encrypted-message-1", sender: "valid-user-id" }),
        },
        {
            _id: "message-id-2",
            sender: "other-user-id",
            message: "encrypted-message-2",
            iv: "iv-2",
            toObject: jest.fn().mockReturnValue({ _id: "message-id-2", message: "encrypted-message-2", sender: "other-user-id" }),
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return decrypted messages with isSender property", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);
        getItems.mockResolvedValueOnce(mockMessages);
        decrypt.mockImplementation(({ iv, encryptedData }) => `${encryptedData}-decrypted`);

        const result = await message_by_conversation_service(conversationId, userId);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
        expect(getItems).toHaveBeenCalledWith(Message, { conversation: conversationId }, { createdAt: 1, path: "readBy" });

        expect(decrypt).toHaveBeenCalledTimes(2);
        expect(decrypt).toHaveBeenCalledWith({ iv: "iv-1", encryptedData: "encrypted-message-1" });
        expect(decrypt).toHaveBeenCalledWith({ iv: "iv-2", encryptedData: "encrypted-message-2" });

        expect(result).toEqual([
            {
                _id: "message-id-1",
                message: "encrypted-message-1-decrypted",
                sender: "valid-user-id",
                isSender: true,
            },
            {
                _id: "message-id-2",
                message: "encrypted-message-2-decrypted",
                sender: "other-user-id",
                isSender: false,
            },
        ]);
    });

    it("should throw a 404 error if conversation is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(null);

        await expect(message_by_conversation_service(conversationId, userId)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw a 403 error if the user is not a participant in the conversation", async () => {
        const mockConversationWithoutUser = {
            _id: conversationId,
            participants: [{ user: "other-user-id" }],
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversationWithoutUser);

        await expect(message_by_conversation_service(conversationId, userId)).rejects.toEqual({
            code: 403,
            message: "You are not a participant in this conversation",
        });
    });

    it("should throw a 500 error for an unknown failure", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockRejectedValueOnce(new Error("Unknown error"));

        await expect(message_by_conversation_service(conversationId, userId)).rejects.toEqual({
            code: 500,
            message: "Internal Server Error",
        });
    });
});