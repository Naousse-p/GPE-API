const { sticker_book_stat_count_acquired_by_category_service } = require("../../../src/controllers/sticker-book/services");
const { Student, AcquiredSticker, Sticker } = require("../../../src/models");
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

describe("sticker_book_stat_count_acquired_by_category_service", () => {
    const studentId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString(), role: ["parents"] };
    const mockStudent = {
        _id: studentId,
        class: { _id: new mongoose.Types.ObjectId(), professor: [{ user: userId }] },
        parent: [{ user: userId.toString() }],
    };
    const mockStickers = [
        { category: "Devenir élève" },
        { category: "Mobiliser le langage" },
        { category: "Agir à travers l’activité physique" },
    ];
    const mockAcquiredStickers = [
        { sticker: { category: "Devenir élève" } },
        { sticker: { category: "Mobiliser le langage" } },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return count of stickers and acquired stickers categorized by category", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItems
            .mockResolvedValueOnce(mockStickers) 
            .mockResolvedValueOnce(mockAcquiredStickers);

        const result = await sticker_book_stat_count_acquired_by_category_service(studentId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(studentId.toString());
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
        expect(getItems).toHaveBeenCalledWith(Sticker, { class: mockStudent.class._id });
        expect(getItems).toHaveBeenCalledWith(AcquiredSticker, { student: studentId }, { path: "sticker" });

        expect(result).toEqual({
            "Devenir élève": { countInClass: 1, countAcquired: 1 },
            "Mobiliser le langage": { countInClass: 1, countAcquired: 1 },
            "Agir à travers l’activité physique": { countInClass: 1, countAcquired: 0 },
        });
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_book_stat_count_acquired_by_category_service(studentId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the student's stickers", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce({ ...mockStudent, parent: [{ user: otherUserId.toString() }] });

        await expect(sticker_book_stat_count_acquired_by_category_service(studentId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });
});