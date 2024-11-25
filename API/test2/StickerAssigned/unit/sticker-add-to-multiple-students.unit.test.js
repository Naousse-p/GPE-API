const { sticker_add_to_multiple_student_service } = require("../../../src/controllers/sticker-assigned/services");
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

describe("sticker_add_to_multiple_student_service", () => {
    const userId = new mongoose.Types.ObjectId();
    const studentId1 = new mongoose.Types.ObjectId();
    const studentId2 = new mongoose.Types.ObjectId();
    const stickerId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString() };
    const mockClass = {
        _id: new mongoose.Types.ObjectId(),
        professor: [{ user: userId }],
    };
    const mockStudent1 = {
        _id: studentId1,
        class: mockClass,
        level: "Level 1",
    };
    const mockStudent2 = {
        _id: studentId2,
        class: mockClass,
        level: "Level 1",
    };
    const mockSticker = {
        _id: stickerId,
        class: [mockClass],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should add the sticker to multiple students successfully", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        isIDGood.mockResolvedValueOnce(studentId1);
        isIDGood.mockResolvedValueOnce(studentId2);
        getItemById.mockResolvedValueOnce(mockSticker);
        getItemById.mockResolvedValueOnce(mockStudent1);
        getItemById.mockResolvedValueOnce(mockStudent2);
        getOneItem.mockResolvedValueOnce(null);
        getOneItem.mockResolvedValueOnce(null);
        createItem.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
        createItem.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() }); 

        const studentsIds = [studentId1.toString(), studentId2.toString()];
        const result = await sticker_add_to_multiple_student_service(studentsIds, stickerId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(stickerId.toString());
        expect(isIDGood).toHaveBeenCalledWith(studentId1.toString());
        expect(isIDGood).toHaveBeenCalledWith(studentId2.toString());
        expect(getItemById).toHaveBeenCalledWith(Sticker, stickerId, "class");
        expect(getItemById).toHaveBeenCalledWith(Student, studentId1, { path: "class", populate: { path: "professor" } });
        expect(getItemById).toHaveBeenCalledWith(Student, studentId2, { path: "class", populate: { path: "professor" } });
        expect(getOneItem).toHaveBeenCalledWith(AcquiredSticker, { sticker: stickerId, student: studentId1 });
        expect(getOneItem).toHaveBeenCalledWith(AcquiredSticker, { sticker: stickerId, student: studentId2 });
        expect(createItem).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
    });

    it("should throw a 404 error if the sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        isIDGood.mockResolvedValueOnce(studentId1);
        isIDGood.mockResolvedValueOnce(studentId2);
        getItemById.mockResolvedValueOnce(null);

        const studentsIds = [studentId1.toString(), studentId2.toString()];

        await expect(sticker_add_to_multiple_student_service(studentsIds, stickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Sticker not found",
        });
    });

    it("should throw a 404 error if a student is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        isIDGood.mockResolvedValueOnce(studentId1);
        isIDGood.mockResolvedValueOnce(studentId2);
        getItemById.mockResolvedValueOnce(mockSticker);
        getItemById.mockResolvedValueOnce(null);

        const studentsIds = [studentId1.toString(), studentId2.toString()];

        await expect(sticker_add_to_multiple_student_service(studentsIds, stickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 409 error if a student already has the sticker", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        isIDGood.mockResolvedValueOnce(studentId1);
        isIDGood.mockResolvedValueOnce(studentId2);
        getItemById.mockResolvedValueOnce(mockSticker);
        getItemById.mockResolvedValueOnce(mockStudent1);
        getOneItem.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });

        const studentsIds = [studentId1.toString(), studentId2.toString()];

        await expect(sticker_add_to_multiple_student_service(studentsIds, stickerId.toString(), req)).rejects.toEqual({
            code: 409,
            message: "Student already has this sticker",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the student and sticker", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        isIDGood.mockResolvedValueOnce(studentId1);
        isIDGood.mockResolvedValueOnce(studentId2);
        getItemById.mockResolvedValueOnce(mockSticker);
        getItemById.mockResolvedValueOnce(mockStudent1);
        getOneItem.mockResolvedValueOnce(null);
        const mockOtherUserId = new mongoose.Types.ObjectId();
        const mockOtherClass = { _id: new mongoose.Types.ObjectId(), professor: [{ user: mockOtherUserId }] };
        getItemById.mockResolvedValueOnce({ ...mockStudent1, class: mockOtherClass });

        const studentsIds = [studentId1.toString(), studentId2.toString()];

        await expect(sticker_add_to_multiple_student_service(studentsIds, stickerId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        isIDGood.mockResolvedValueOnce(studentId1);
        isIDGood.mockResolvedValueOnce(studentId2);
        getItemById.mockRejectedValueOnce(new Error("Unexpected error"));

        const studentsIds = [studentId1.toString(), studentId2.toString()];

        await expect(sticker_add_to_multiple_student_service(studentsIds, stickerId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});