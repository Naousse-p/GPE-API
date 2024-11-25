const { sticker_book_acquired_by_student_history_service } = require("../../../src/controllers/sticker-book/services");
const { Student, AcquiredSticker } = require("../../../src/models");
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

describe("sticker_book_acquired_by_student_history_service", () => {
    const studentId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString(), role: ["parents"] };

    const mockStudent = {
        _id: studentId,
        parent: [{ user: userId }],
        class: { professor: [{ user: userId }] },
    };

    const mockAcquiredStickers = [
        { level: "ps", sticker: { isPublished: true } },
        { level: "ms", sticker: { isPublished: true } },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return acquired stickers by level for the student", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItems.mockResolvedValueOnce(mockAcquiredStickers);

        const result = await sticker_book_acquired_by_student_history_service(studentId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(studentId.toString());
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, [
            { path: "class", populate: { path: "professor" } },
            "parent",
        ]);

        expect(result).toEqual({
            ps: [mockAcquiredStickers[0]],
            ms: [mockAcquiredStickers[1]],
            gs: [],
        });
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_book_acquired_by_student_history_service(studentId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the student's data", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce({ ...mockStudent, parent: [{ user: otherUserId }] });

        await expect(sticker_book_acquired_by_student_history_service(studentId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should only return published stickers for parents", async () => {
        req.role = ["parents"];
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItems.mockResolvedValueOnce(mockAcquiredStickers);

        const result = await sticker_book_acquired_by_student_history_service(studentId.toString(), req);

        expect(result).toEqual({
            ps: [mockAcquiredStickers[0]],
            ms: [mockAcquiredStickers[1]],
            gs: [],
        });
    });

    it("should return all acquired stickers for professors", async () => {
        req.role = ["professor"];
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItems.mockResolvedValueOnce(mockAcquiredStickers);

        const result = await sticker_book_acquired_by_student_history_service(studentId.toString(), req);
        expect(result).toEqual({
            ps: [mockAcquiredStickers[0]],
            ms: [mockAcquiredStickers[1]],
            gs: [],
        });
    });
});