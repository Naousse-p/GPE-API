const { sticker_get_student_without_service } = require("../../../src/controllers/sticker-assigned/services");
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

describe("sticker_get_student_without_service", () => {
    const stickerId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const req = { userId: userId.toString() };
    const mockSticker = {
        _id: stickerId,
        class: [
            {
                professor: [{ user: userId }]
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return students without the specified sticker", async () => {
        const mockAcquiredStickers = [
            { student: new mongoose.Types.ObjectId() },
            { student: new mongoose.Types.ObjectId() },
        ];
        const mockStudents = [
            { _id: new mongoose.Types.ObjectId(), name: "Student 1" },
            { _id: new mongoose.Types.ObjectId(), name: "Student 2" },
        ];

        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);
        getItems.mockResolvedValueOnce(mockAcquiredStickers);
        getItems.mockResolvedValueOnce(mockStudents);

        const result = await sticker_get_student_without_service(stickerId.toString(), classId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(stickerId.toString());
        expect(getItemById).toHaveBeenCalledWith(Sticker, stickerId, { path: "class", populate: { path: "professor" } });
        expect(getItems).toHaveBeenCalledWith(AcquiredSticker, { sticker: stickerId }, "student");
        expect(result).toEqual(mockStudents);
    });

    it("should throw a 404 error if the sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_get_student_without_service(stickerId.toString(), classId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Sticker not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the sticker", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce({
            _id: stickerId,
            class: [
                {
                    professor: [{ user: new mongoose.Types.ObjectId() }],
                }
            ]
        });

        await expect(sticker_get_student_without_service(stickerId.toString(), classId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockRejectedValueOnce(new Error("Unexpected error"));

        await expect(sticker_get_student_without_service(stickerId.toString(), classId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});