const { sticker_by_class_service } = require("../../../src/controllers/sticker/services/sticker-by-class.service");
const { Sticker, Class } = require("../../../src/models");
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

describe("sticker_by_class_service", () => {
    const classId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const mockClassroom = {
        _id: classId,
        professor: [{ user: userId }],
    };

    const req = {
        userId: userId.toString(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return stickers grouped by category if user has permission", async () => {
        const mockStickers = [
            { category: "math", name: "sticker1" },
            { category: "science", name: "sticker2" },
            { category: "math", name: "sticker3" },
        ];

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClassroom);
        getItems.mockResolvedValueOnce(mockStickers);

        const result = await sticker_by_class_service(classId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(classId.toString());
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor");
        expect(getItems).toHaveBeenCalledWith(Sticker, { class: classId });

        expect(result).toEqual({
            math: [mockStickers[0], mockStickers[2]],
            science: [mockStickers[1]],
        });
    });

    it("should throw a 404 error if class is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_by_class_service(classId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });
    });

    it("should throw a 403 error if user does not have permission for the class", async () => {
        const otherUserId = new mongoose.Types.ObjectId();

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce({ ...mockClassroom, professor: [{ user: otherUserId }] });

        await expect(sticker_by_class_service(classId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should return an empty object if no stickers are found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClassroom);
        getItems.mockResolvedValueOnce([]);

        const result = await sticker_by_class_service(classId.toString(), req);

        expect(result).toEqual({});
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockRejectedValueOnce(new Error("Unexpected Error"));

        await expect(sticker_by_class_service(classId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected Error",
        });
    });
});