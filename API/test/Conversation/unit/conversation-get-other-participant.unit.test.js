const { conversation_get_other_participant_service } = require("../../../src/controllers/conversation/services");
const { Conversation } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/models", () => ({
    Conversation: {},
}));

describe("conversation_get_other_participant_service", () => {
    const req = { userId: '66f2cb0f4fdcbc98068de053' };
    const conversationId = new mongoose.Types.ObjectId();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return other participants in the conversation", async () => {
        const mockConversation = {
            _id: conversationId,
            participants: [
                { user: new mongoose.Types.ObjectId(req.userId), role: "participant" },
                { user: new mongoose.Types.ObjectId(), role: "participant" },
            ],
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);

        const result = await conversation_get_other_participant_service(conversationId.toString(), req);
        console.log(result)
        expect(isIDGood).toHaveBeenCalledWith(conversationId.toString());
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId.toString());
        expect(result).toHaveLength(1);
        expect(result[0].user).not.toEqual(req.userId);
    });

    it("should throw an error if conversation is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(null); 

        await expect(conversation_get_other_participant_service(conversationId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw an error if the user does not have permission to access the conversation", async () => {
        const mockConversation = {
            _id: conversationId,
            participants: [{ user: new mongoose.Types.ObjectId(), role: "participant" }],
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);

        await expect(conversation_get_other_participant_service(conversationId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a generic error if something goes wrong", async () => {
        isIDGood.mockRejectedValueOnce(new Error("Something went wrong"));

        await expect(conversation_get_other_participant_service(conversationId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Something went wrong",
        });
    });
});