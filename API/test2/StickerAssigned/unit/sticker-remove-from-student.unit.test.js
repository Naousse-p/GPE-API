const { sticker_remove_from_student_service } = require("../../../src/controllers/sticker-assigned/services");
const { AcquiredSticker } = require("../../../src/models");
const { getItemById, deleteItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");

describe("sticker_remove_from_student_service", () => {
    const studentId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString() };
    const acquiredStickerId = new mongoose.Types.ObjectId();

    const mockAcquiredSticker = {
        _id: acquiredStickerId,
        student: {
            _id: studentId,
            class: {
                professor: [{ user: userId }],
            },
        },
    };

    const body = {
        AssignedStickerIds: [acquiredStickerId.toString()],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove the assigned stickers from the student successfully", async () => {
        const filePath = path.join(__dirname, "../../../../", "uploads/comment-image", `${acquiredStickerId}_source.jpg`);

        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce(mockAcquiredSticker);
        fs.existsSync.mockReturnValueOnce(true);

        await sticker_remove_from_student_service(body, studentId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(acquiredStickerId.toString());
        expect(getItemById).toHaveBeenCalledWith(AcquiredSticker, acquiredStickerId, { path: "student", populate: { path: "class", populate: { path: "professor" } } });
        expect(deleteItem).toHaveBeenCalledWith(AcquiredSticker, acquiredStickerId);
    });

    it("should throw 400 if AssignedStickerIds is not an array", async () => {
        const invalidBody = { AssignedStickerIds: "invalid" };

        await expect(sticker_remove_from_student_service(invalidBody, studentId.toString(), req)).rejects.toEqual({
            code: 400,
            message: "AssignedStickerIds should be an array",
        });
    });

    it("should throw 404 if acquired sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_remove_from_student_service(body, studentId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Acquired sticker not found",
        });
    });

    it("should throw 403 if the user does not have permission to remove the sticker", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        const mockAcquiredStickerNoAccess = {
            ...mockAcquiredSticker,
            student: {
                ...mockAcquiredSticker.student,
                class: {
                    professor: [{ user: otherUserId }],
                },
            },
        };

        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce(mockAcquiredStickerNoAccess);

        await expect(sticker_remove_from_student_service(body, studentId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw 403 if the sticker does not belong to the specified student", async () => {
        const otherStudentId = new mongoose.Types.ObjectId();
        const mockAcquiredStickerOtherStudent = {
            ...mockAcquiredSticker,
            student: { _id: otherStudentId, class: { professor: [{ user: userId }] } },
        };

        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce(mockAcquiredStickerOtherStudent);

        await expect(sticker_remove_from_student_service(body, studentId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "The sticker does not belong to the specified student",
        });
    });

    it("should handle the case where the image file does not exist", async () => {
        isIDGood.mockResolvedValueOnce(acquiredStickerId);
        getItemById.mockResolvedValueOnce(mockAcquiredSticker);
        fs.existsSync.mockReturnValueOnce(false);

        await sticker_remove_from_student_service(body, studentId.toString(), req);

        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.unlinkSync).not.toHaveBeenCalled();
        expect(deleteItem).toHaveBeenCalledWith(AcquiredSticker, acquiredStickerId);
    });
});