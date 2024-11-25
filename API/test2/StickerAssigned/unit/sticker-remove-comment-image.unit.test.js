const { sticker_remove_comment_image_service } = require("../../../src/controllers/sticker-assigned/services");
const { AcquiredSticker } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");

describe("sticker_remove_comment_image_service", () => {
    const acquiredStickerId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString() };

    const mockAcquiredSticker = {
        _id: acquiredStickerId,
        student: {
            class: {
                professor: [{ user: userId }],
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove the comment image from the acquired sticker successfully", async () => {
        const filePath = path.join(__dirname, "../../../../", "uploads/comment-image", `${acquiredStickerId}_source.jpg`);

        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce(mockAcquiredSticker);
        fs.existsSync.mockReturnValueOnce(true);

        const updatedSticker = { ...mockAcquiredSticker, comment: null, source: null };
        updateItem.mockResolvedValueOnce(updatedSticker);

        const result = await sticker_remove_comment_image_service(acquiredStickerId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(acquiredStickerId.toString());
        expect(getItemById).toHaveBeenCalledWith(AcquiredSticker, acquiredStickerId, { path: "student", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).toHaveBeenCalledWith(AcquiredSticker, acquiredStickerId, { comment: null, source: null });
        expect(result).toEqual(updatedSticker);
    });

    it("should throw 404 error if the acquired sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_remove_comment_image_service(acquiredStickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Acquired sticker not found",
        });
    });

    it("should throw 403 error if the user does not have permission", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce({
            ...mockAcquiredSticker,
            student: {
                class: {
                    professor: [{ user: otherUserId }],
                },
            },
        });

        await expect(sticker_remove_comment_image_service(acquiredStickerId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should handle the case where the image file does not exist", async () => {
        const filePath = path.join(__dirname, "../../../../", "uploads/comment-image", `${acquiredStickerId}_source.jpg`);

        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce(mockAcquiredSticker);
        fs.existsSync.mockReturnValueOnce(false);

        const updatedSticker = { ...mockAcquiredSticker, comment: null, source: null };
        updateItem.mockResolvedValueOnce(updatedSticker);

        const result = await sticker_remove_comment_image_service(acquiredStickerId.toString(), req);

        expect(updateItem).toHaveBeenCalledWith(AcquiredSticker, acquiredStickerId, { comment: null, source: null });
        expect(result).toEqual(updatedSticker);
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockRejectedValueOnce(new Error("Unexpected error"));

        await expect(sticker_remove_comment_image_service(acquiredStickerId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});