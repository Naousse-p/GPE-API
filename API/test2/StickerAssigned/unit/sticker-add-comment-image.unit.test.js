const { sticker_add_comment_image_service } = require("../../../src/controllers/sticker-assigned/services");
const { AcquiredSticker } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../src/utils/multer");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/multer", () => ({
    saveSourceFile: jest.fn(),
}));

describe("sticker_add_comment_image_service", () => {
    const assignedStickerId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const mockClass = {
        _id: new mongoose.Types.ObjectId(),
        professor: [{ user: userId }],
    };
    const mockStudent = {
        class: mockClass,
    };
    const mockAssignedSticker = {
        _id: assignedStickerId,
        student: mockStudent,
        save: jest.fn(),
    };

    const req = {
        userId: userId.toString(),
        file: {
            buffer: Buffer.from("fileBuffer"),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should add a comment and image to the acquired sticker successfully", async () => {
        isIDGood.mockResolvedValueOnce(assignedStickerId);
        getItemById.mockResolvedValueOnce(mockAssignedSticker);
        saveSourceFile.mockResolvedValueOnce("path/to/comment/image");
        updateItem.mockResolvedValueOnce(mockAssignedSticker);

        const data = {
            comment: "Great sticker!",
        };

        const result = await sticker_add_comment_image_service(assignedStickerId.toString(), data, req);

        expect(isIDGood).toHaveBeenCalledWith(assignedStickerId.toString());
        expect(getItemById).toHaveBeenCalledWith(AcquiredSticker, assignedStickerId, {
            path: "student",
            populate: { path: "class", populate: { path: "professor" } },
        });
        expect(saveSourceFile).toHaveBeenCalledWith(req.file.buffer, assignedStickerId, "comment-image", "jpg", false);
        expect(result).toEqual(mockAssignedSticker);
    });

    it("should throw a 404 error if the acquired sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(assignedStickerId);
        getItemById.mockResolvedValueOnce(null);

        const data = {
            comment: "Great sticker!",
        };

        await expect(sticker_add_comment_image_service(assignedStickerId.toString(), data, req)).rejects.toEqual({
            code: 404,
            message: "Acquired sticker not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the sticker", async () => {
        isIDGood.mockResolvedValueOnce(assignedStickerId);
        const mockOtherUserId = new mongoose.Types.ObjectId();
        getItemById.mockResolvedValueOnce({
            ...mockAssignedSticker,
            student: { class: { professor: [{ user: mockOtherUserId }] } },
        });

        const data = {
            comment: "Great sticker!",
        };

        await expect(sticker_add_comment_image_service(assignedStickerId.toString(), data, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should update only the comment if no image is provided", async () => {
        isIDGood.mockResolvedValueOnce(assignedStickerId);
        getItemById.mockResolvedValueOnce(mockAssignedSticker);
        updateItem.mockResolvedValueOnce(mockAssignedSticker);

        const data = {
            comment: "Nice work!",
        };

        const result = await sticker_add_comment_image_service(assignedStickerId.toString(), data, { ...req, file: null });

        expect(saveSourceFile).not.toHaveBeenCalled();
        expect(result).toEqual(mockAssignedSticker);
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockResolvedValueOnce(assignedStickerId);
        getItemById.mockRejectedValueOnce(new Error("Unexpected error"));

        const data = {
            comment: "Nice work!",
        };

        await expect(sticker_add_comment_image_service(assignedStickerId.toString(), data, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});