const { message_update_service } = require("../../../src/controllers/message/services");
const { Message } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { encrypt } = require("../../../src/controllers/message/helpers/encrypt-decrypt.helper");

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/controllers/message/helpers/encrypt-decrypt.helper", () => ({
    encrypt: jest.fn(),
}));

describe("message_update_service", () => {
    const messageId = "valid-message-id";
    const userId = "valid-user-id";
    const mockMessage = {
        _id: messageId,
        sender: userId,
        message: "original message",
        iv: "original-iv",
        updatedAt: new Date(),
        previousMessages: [],
        save: jest.fn(),
    };

    const body = { message: "new message" };
    const encryptedMessage = {
        encryptedData: "encrypted-new-message",
        iv: "new-iv",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the message successfully", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(mockMessage);
        encrypt.mockReturnValueOnce(encryptedMessage);

        const result = await message_update_service(messageId, userId, body);

        expect(isIDGood).toHaveBeenCalledWith(messageId);
        expect(getItemById).toHaveBeenCalledWith(Message, messageId);
        expect(encrypt).toHaveBeenCalledWith(body.message);
        expect(mockMessage.previousMessages).toHaveLength(1);
        expect(mockMessage.previousMessages[0]).toEqual({
            message: "original message",
            editedAt: mockMessage.updatedAt,
        });
        expect(mockMessage.message).toBe("encrypted-new-message");
        expect(mockMessage.iv).toBe("new-iv");
        expect(mockMessage.edited).toBe(true);
        expect(mockMessage.save).toHaveBeenCalled();
        expect(result).toBe(mockMessage);
    });

    it("should throw an error if the message is not found", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce(null);

        await expect(message_update_service(messageId, userId, body)).rejects.toEqual({
            code: 404,
            message: "Message not found",
        });
    });

    it("should throw an error if the user is not the sender", async () => {
        isIDGood.mockResolvedValueOnce(true);
        getItemById.mockResolvedValueOnce({ ...mockMessage, sender: "other-user-id" });

        await expect(message_update_service(messageId, userId, body)).rejects.toEqual({
            code: 403,
            message: "You do not have permission to edit this message",
        });
    });
});