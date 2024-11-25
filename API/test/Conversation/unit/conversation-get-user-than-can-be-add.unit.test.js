const { conversation_get_user_than_can_be_add_service } = require("../../../src/controllers/conversation/services");
const { Conversation, Parent, Class } = require("../../../src/models");
const { getItemById, getOneItem, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("conversation_get_user_than_can_be_add_service", () => {
    const req = { userId: new mongoose.Types.ObjectId().toString(), role: ["professor"] };
    const conversationId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a list of users who can be added to the conversation", async () => {
        const mockConversation = {
            _id: conversationId,
            class: new mongoose.Types.ObjectId().toString(),
            participants: [{ user: req.userId }],
        };

        const mockParents = [
            { user: new mongoose.Types.ObjectId().toString(), lastname: "Test1", firstname: "Testjo" },
            { user: new mongoose.Types.ObjectId().toString(), lastname: "Test2", firstname: "Testjojo" },
        ];

        const mockTeacher = {
            professor: [
                { user: req.userId, lastname: "Current", firstname: "Professor" }, 
                { user: new mongoose.Types.ObjectId().toString(), lastname: "Test3", firstname: "Testjojojo" },
            ],
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);
        getItems.mockResolvedValueOnce(mockParents);
        getOneItem.mockResolvedValueOnce(mockTeacher); 

        const result = await conversation_get_user_than_can_be_add_service(conversationId, req);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
        expect(getItems).toHaveBeenCalledWith(Parent, { children: { $elemMatch: { class: mockConversation.class } } });
        expect(getOneItem).toHaveBeenCalledWith(Class, { _id: mockConversation.class }, { path: "professor" });

        expect(result.parents).toHaveLength(2); 
        expect(result.teachers).toHaveLength(1); 
        expect(result.teachers[0].lastname).toBe("Test3");
    });

    it("should throw an error if conversation is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(null); 

        await expect(conversation_get_user_than_can_be_add_service(conversationId, req)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw an error if the user does not have permission to access the conversation", async () => {
        const mockConversation = {
            _id: conversationId,
            class: new mongoose.Types.ObjectId().toString(),
            participants: [{ user: new mongoose.Types.ObjectId().toString() }],
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);

        await expect(conversation_get_user_than_can_be_add_service(conversationId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });
});