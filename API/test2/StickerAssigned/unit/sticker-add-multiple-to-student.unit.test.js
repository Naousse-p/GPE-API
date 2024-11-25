const { sticker_add_multiple_to_student_service } = require("../../../src/controllers/sticker-assigned/services/sticker-add-multiple-to-student.service");
const { Student, Sticker, AcquiredSticker } = require("../../../src/models");
const { createItem, getItemById, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    createItem: jest.fn(),
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("sticker_add_multiple_to_student_service", () => {
    const userId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const stickerId1 = new mongoose.Types.ObjectId();
    const stickerId2 = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString() };
    const mockClass = {
        _id: new mongoose.Types.ObjectId(),
        professor: [{ user: userId }],
    };
    const mockStudent = {
        _id: studentId,
        class: mockClass,
        level: "Level 1",
    };
    const mockSticker1 = {
        _id: stickerId1,
        class: [mockClass],
    };
    const mockSticker2 = {
        _id: stickerId2,
        class: [mockClass],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should add multiple stickers to the student successfully", async () => {
        isIDGood.mockResolvedValueOnce(stickerId1);
        isIDGood.mockResolvedValueOnce(stickerId2);
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItemById.mockResolvedValueOnce(mockSticker1);
        getItemById.mockResolvedValueOnce(mockSticker2);
        getOneItem.mockResolvedValueOnce(null);
        getOneItem.mockResolvedValueOnce(null);
        createItem.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
        createItem.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });

        const stickersIds = [stickerId1.toString(), stickerId2.toString()];
        const result = await sticker_add_multiple_to_student_service(stickersIds, studentId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(stickerId1.toString());
        expect(isIDGood).toHaveBeenCalledWith(stickerId2.toString());
        expect(isIDGood).toHaveBeenCalledWith(studentId.toString());
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
        expect(getItemById).toHaveBeenCalledWith(Sticker, stickerId1, "class");
        expect(getItemById).toHaveBeenCalledWith(Sticker, stickerId2, "class");
        expect(getOneItem).toHaveBeenCalledWith(AcquiredSticker, { sticker: stickerId1, student: studentId });
        expect(createItem).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId1);
        isIDGood.mockResolvedValueOnce(stickerId2);
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        const stickersIds = [stickerId1.toString(), stickerId2.toString()];

        await expect(sticker_add_multiple_to_student_service(stickersIds, studentId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the student", async () => {
        isIDGood.mockResolvedValueOnce(stickerId1);
        isIDGood.mockResolvedValueOnce(stickerId2);
        isIDGood.mockResolvedValueOnce(studentId);
        const mockOtherUserId = new mongoose.Types.ObjectId();
        const mockOtherClass = { _id: new mongoose.Types.ObjectId(), professor: [{ user: mockOtherUserId }] };
        getItemById.mockResolvedValueOnce({ ...mockStudent, class: mockOtherClass });

        const stickersIds = [stickerId1.toString(), stickerId2.toString()];

        await expect(sticker_add_multiple_to_student_service(stickersIds, studentId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 404 error if a sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId1);
        isIDGood.mockResolvedValueOnce(stickerId2);
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItemById.mockResolvedValueOnce(null);

        const stickersIds = [stickerId1.toString(), stickerId2.toString()];

        await expect(sticker_add_multiple_to_student_service(stickersIds, studentId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Sticker not found",
        });
    });

    it("should throw a 409 error if the student already has the sticker", async () => {
        isIDGood.mockResolvedValueOnce(stickerId1);
        isIDGood.mockResolvedValueOnce(stickerId2);
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItemById.mockResolvedValueOnce(mockSticker1);
        getOneItem.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });

        const stickersIds = [stickerId1.toString(), stickerId2.toString()];

        await expect(sticker_add_multiple_to_student_service(stickersIds, studentId.toString(), req)).rejects.toEqual({
            code: 409,
            message: "Student already has this sticker",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockResolvedValueOnce(stickerId1);
        isIDGood.mockResolvedValueOnce(stickerId2);
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockRejectedValueOnce(new Error("Unexpected error"));

        const stickersIds = [stickerId1.toString(), stickerId2.toString()];

        await expect(sticker_add_multiple_to_student_service(stickersIds, studentId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});