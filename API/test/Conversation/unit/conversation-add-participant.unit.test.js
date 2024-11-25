const { Conversation, User, Parent, Professor } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById, getOneItem, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { conversation_add_participant_service } = require("../../../src/controllers/conversation/services");

jest.mock("../../../src/models", () => ({
    Conversation: {
        find: jest.fn(),
    },
    User: jest.fn(),
    Parent: jest.fn(),
    Professor: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
    updateItem: jest.fn(),
}));

describe("conversation_add_participant_service", () => {
    const req = { userId: "adminUser" };
    const conversationId = "valid-conversation-id";
    const body = { participants: [{ user: "newParticipantId", role: "participant" }] };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return an existing conversation if participants already exist", async () => {
        const conversationId = "valid-conversation-id";
        const req = { userId: "adminUser" };
        const body = {
            participants: [{ user: "newParticipantId", role: "participant" }],
        };

        const mockConversation = {
            participants: [{ user: "adminUser", role: "admin", name: undefined }],
            class: "class1",
        };

        const mockExistingConversation = {
            participants: [
                { user: "adminUser", role: "admin", name: undefined },
                { user: "newParticipantId", role: "participant", name: "jac li" },
            ],
            class: "class1",
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation); 
        getOneItem.mockResolvedValueOnce({ lastname: "li", firstname: "jac" }); 
        getItemById.mockResolvedValueOnce({ _id: "newParticipantId", roles: [{ name: "participant" }] });

        Conversation.find = jest.fn().mockResolvedValueOnce([mockExistingConversation]);

        const result = await conversation_add_participant_service(conversationId, body, req);
        expect(result).toEqual(mockExistingConversation);
    });

    it("should return an existing conversation if participants already exist", async () => {
        const conversationId = "valid-conversation-id";
        const req = { userId: "adminUser" };
        const body = {
            participants: [{ user: "newParticipantId", role: "participant" }],
        };

        const mockConversation = {
            participants: [{ user: "adminUser", role: "admin" }],
            class: "class1",
        };

        const mockExistingConversation = {
            participants: [
                { user: "adminUser", role: "admin" },
                { user: "newParticipantId", role: "participant", name: "jac li" },
            ],
            class: "class1",
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);
        getOneItem.mockResolvedValueOnce({ lastname: "li", firstname: "jac" }); 
        getItemById.mockResolvedValueOnce({ _id: "newParticipantId", roles: [{ name: "participant" }] });

        Conversation.find.mockResolvedValueOnce([mockExistingConversation]);

        const result = await conversation_add_participant_service(conversationId, body, req);
        expect(result).toEqual(mockExistingConversation);
    });

    it("should throw an error if the user does not have permission", async () => {
        const mockConversation = {
            participants: [{ user: "differentUser", role: "participant" }],
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);

        await expect(conversation_add_participant_service(conversationId, body, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw an error if the user is not an admin", async () => {
        const mockConversation = {
            participants: [{ user: "adminUser", role: "participant" }],
        };

        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(mockConversation);

        await expect(conversation_add_participant_service(conversationId, body, req)).rejects.toEqual({
            code: 403,
            message: "Only admins can add participants to the conversation",
        });
    });

    it("should throw an error if conversation does not exist", async () => {
        isIDGood.mockResolvedValueOnce(conversationId);
        getItemById.mockResolvedValueOnce(null);

        await expect(conversation_add_participant_service(conversationId, body, req)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });
});