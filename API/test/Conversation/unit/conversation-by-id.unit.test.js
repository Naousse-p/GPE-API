const { conversation_by_id_service } = require("../../../src/controllers/conversation/services");
const { Conversation } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/models", () => ({
    Conversation: {
        findById: jest.fn(),
    },
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("conversation_by_id_service", () => {
    const req = { userId: "user-id" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the conversation with isAdmin true when user is admin", async () => {
        const conversationId = "valid-conversation-id";
        const mockConversation = {
            _id: conversationId,
            participants: [{ user: "user-id", role: "admin" }],
            toObject: jest.fn().mockReturnValue({ _id: conversationId, participants: [{ user: "user-id", role: "admin" }] }),
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);

        const result = await conversation_by_id_service(conversationId, req);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
        expect(result).toEqual({
            _id: conversationId,
            participants: [{ user: "user-id", role: "admin" }],
            isAdmin: true,
        });
    });

    it("should return the conversation with isAdmin false when user is not admin", async () => {
        const conversationId = "valid-conversation-id";
        const mockConversation = {
            _id: conversationId,
            participants: [{ user: "user-id", role: "participant" }],
            toObject: jest.fn().mockReturnValue({ _id: conversationId, participants: [{ user: "user-id", role: "participant" }] }),
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);

        const result = await conversation_by_id_service(conversationId, req);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
        expect(result).toEqual({
            _id: conversationId,
            participants: [{ user: "user-id", role: "participant" }],
            isAdmin: false,
        });
    });

    it("should throw a 404 error if the conversation is not found", async () => {
        const conversationId = "non-existing-conversation-id";

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(null);

        await expect(conversation_by_id_service(conversationId, req)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        const conversationId = "valid-conversation-id";
        const mockConversation = {
            _id: conversationId,
            participants: [{ user: "other-user-id", role: "participant" }],
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);

        await expect(conversation_by_id_service(conversationId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
    });
});