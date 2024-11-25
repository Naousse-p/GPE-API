const { sticker_book_stat_acquired_by_category_service } = require("../../../src/controllers/sticker-book/services");
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

describe("sticker_book_stat_acquired_by_category_service", () => {
    const studentId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString(), role: ["parents"] };
    const mockStudent = {
        _id: studentId,
        class: { professor: [{ user: userId }] },
        parent: [userId.toString()],
    };
    const mockAcquiredStickers = [
        { sticker: { category: "Devenir élève" } },
        { sticker: { category: "Mobiliser le langage dans toutes ses dimensions" } },
        { sticker: { category: "Agir, s’exprimer, comprendre à travers les activités artistiques" } },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return acquired stickers categorized by category", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItems.mockResolvedValueOnce(mockAcquiredStickers);

        const result = await sticker_book_stat_acquired_by_category_service(studentId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(studentId.toString());
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });

        expect(result).toEqual({
            "Devenir élève": [{ sticker: { category: "Devenir élève" } }],
            "Mobiliser le langage dans toutes ses dimensions": [{ sticker: { category: "Mobiliser le langage dans toutes ses dimensions" } }],
            "Agir, s’exprimer, comprendre à travers les activités artistiques": [{ sticker: { category: "Agir, s’exprimer, comprendre à travers les activités artistiques" } }],
            "Agir, s’exprimer, comprendre à travers l’activité physique": [],
            "Construire les premiers outils pour structurer sa pensée": [],
            "Explorer le monde": [],
        });
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_book_stat_acquired_by_category_service(studentId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the student's stickers", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce({ ...mockStudent, parent: [otherUserId.toString()] });

        await expect(sticker_book_stat_acquired_by_category_service(studentId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });
});