const { message_create_service } = require("../../../src/controllers/message/services");
const { Conversation, Message } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { saveSourceFile } = require("../../../src/utils/multer");
const { encrypt } = require("../../../src/controllers/message/helpers/encrypt-decrypt.helper");

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/utils/multer", () => ({
    saveSourceFile: jest.fn(),
}));

jest.mock("../../../src/controllers/message/helpers/encrypt-decrypt.helper", () => ({
    encrypt: jest.fn(),
}));

jest.mock("../../../src/models", () => ({
    Conversation: {
        findByIdAndUpdate: jest.fn(),
    },
    Message: jest.fn(function (messageData) {
        this.save = jest.fn().mockResolvedValue(this);
        Object.assign(this, messageData);
    }),
}));

describe("message_create_service", () => {
    const conversationId = "valid-conversation-id";
    const req = {
        userId: "valid-user-id",
        file: {
            mimetype: "image/png",
            buffer: Buffer.from("file-content"),
        },
    };
    const body = { content: "Hello, World!" };

    const mockConversation = {
        _id: conversationId,
        participants: [{ user: "valid-user-id", name: "John Doe" }],
        updatedAt: new Date(),
    };

    const encryptedMessage = { encryptedData: "encrypted-data", iv: "random-iv" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a message and save it with file attached", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);
        encrypt.mockReturnValue(encryptedMessage);
        saveSourceFile.mockResolvedValueOnce("uploads/message-file/valid-message-id.png");

        const result = await message_create_service(body, conversationId, req);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
        expect(encrypt).toHaveBeenCalledWith(body.content);

        expect(result.message).toBe(encryptedMessage.encryptedData);
        expect(result.iv).toBe(encryptedMessage.iv);
        expect(result.sender).toBe(req.userId);
        expect(result.conversation).toBe(conversationId);
        expect(result.source).toBe("uploads/message-file/valid-message-id.png");
        expect(result.filetype).toBe("png");
    });

    it("should create a message without file", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversation);
        encrypt.mockReturnValue(encryptedMessage);

        const reqWithoutFile = { ...req, file: undefined };

        const result = await message_create_service(body, conversationId, reqWithoutFile);

        expect(isIDGood).toHaveBeenCalledWith(conversationId);
        expect(getItemById).toHaveBeenCalledWith(Conversation, conversationId);
        expect(encrypt).toHaveBeenCalledWith(body.content);

        expect(result.message).toBe(encryptedMessage.encryptedData);
        expect(result.iv).toBe(encryptedMessage.iv);
        expect(result.sender).toBe(req.userId);
        expect(result.conversation).toBe(conversationId);
        expect(result.source).toBeUndefined();
        expect(result.filetype).toBeUndefined();
    });

    it("should throw an error if the conversation is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(null);

        await expect(message_create_service(body, conversationId, req)).rejects.toEqual({
            code: 404,
            message: "Conversation not found",
        });
    });

    it("should throw an error if the user is not a participant", async () => {
        const mockConversationWithoutUser = {
            _id: conversationId,
            participants: [{ user: "other-user-id" }],
        };

        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockConversationWithoutUser);

        await expect(message_create_service(body, conversationId, req)).rejects.toEqual({
            code: 403,
            message: "You are not a participant in this conversation",
        });
    });
});