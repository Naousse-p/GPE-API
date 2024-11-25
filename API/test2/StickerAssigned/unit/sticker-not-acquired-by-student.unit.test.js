const { sticker_not_acquired_by_student_service } = require("../../../src/controllers/sticker-assigned/services");
const { Student, Sticker, AcquiredSticker } = require("../../../src/models");
const { getItemById, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("sticker_not_acquired_by_student_service", () => {
    const studentId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString() };

    const mockStudent = {
        _id: studentId,
        class: {
            professor: [{ user: userId }]
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return stickers not acquired by the student", async () => {
        const mockAcquiredStickers = [
            { sticker: new mongoose.Types.ObjectId() }
        ];
        const mockStickers = [
            { _id: new mongoose.Types.ObjectId(), name: "Sticker 1" },
            { _id: new mongoose.Types.ObjectId(), name: "Sticker 2" }
        ];

        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItems.mockResolvedValueOnce(mockAcquiredStickers);
        getItems.mockResolvedValueOnce(mockStickers);

        const result = await sticker_not_acquired_by_student_service(studentId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(studentId.toString());
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
        expect(getItems).toHaveBeenCalledWith(AcquiredSticker, { student: studentId }, "sticker");
        expect(getItems).toHaveBeenCalledWith(Sticker, { _id: { $nin: mockAcquiredStickers.map(s => s.sticker) }, class: mockStudent.class }, "class");
        expect(result).toEqual(mockStickers);
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_not_acquired_by_student_service(studentId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the student's stickers", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce({
            ...mockStudent,
            class: { professor: [{ user: otherUserId }] }
        });

        await expect(sticker_not_acquired_by_student_service(studentId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockRejectedValueOnce(new Error("Unexpected error"));

        await expect(sticker_not_acquired_by_student_service(studentId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});