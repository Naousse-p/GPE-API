const { sticker_publish_acquired_service } = require("../../../src/controllers/sticker-assigned/services");
const { AcquiredSticker, Class, Student } = require("../../../src/models");
const { getItemById, getItems, updateItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
    updateItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("sticker_publish_acquired_service", () => {
    const classroomId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString() };

    const mockClassroom = {
        _id: classroomId,
        professor: [{ user: userId }],
    };

    const mockStudents = [
        { _id: new mongoose.Types.ObjectId() },
        { _id: new mongoose.Types.ObjectId() },
    ];

    const mockAcquiredStickers = [
        { _id: new mongoose.Types.ObjectId(), isPublished: false },
        { _id: new mongoose.Types.ObjectId(), isPublished: false },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should publish acquired stickers for the classroom successfully", async () => {
        isIDGood.mockResolvedValueOnce(classroomId);
        getItemById.mockResolvedValueOnce(mockClassroom);
        getItems.mockResolvedValueOnce(mockStudents);
        getItems.mockResolvedValueOnce(mockAcquiredStickers);

        const result = await sticker_publish_acquired_service(classroomId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(classroomId.toString());
        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, { path: "professor" });
        expect(getItems).toHaveBeenCalledWith(Student, { class: classroomId });
        expect(getItems).toHaveBeenCalledWith(AcquiredSticker, { student: { $in: mockStudents.map((student) => student._id) }, isPublished: false });
        expect(updateItems).toHaveBeenCalledWith(AcquiredSticker, { _id: { $in: mockAcquiredStickers.map((sticker) => sticker._id) } }, { isPublished: true });
        expect(result).toEqual(mockAcquiredStickers);
    });

    it("should return an empty array if no stickers need to be published", async () => {
        isIDGood.mockResolvedValueOnce(classroomId);
        getItemById.mockResolvedValueOnce(mockClassroom);
        getItems.mockResolvedValueOnce(mockStudents);
        getItems.mockResolvedValueOnce([]);

        const result = await sticker_publish_acquired_service(classroomId.toString(), req);

        expect(result).toEqual([]);
    });

    it("should throw a 404 error if the classroom is not found", async () => {
        isIDGood.mockResolvedValueOnce(classroomId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_publish_acquired_service(classroomId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Classroom not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to access the classroom", async () => {
        isIDGood.mockResolvedValueOnce(classroomId);
        getItemById.mockResolvedValueOnce({
            ...mockClassroom,
            professor: [{ user: new mongoose.Types.ObjectId() }],
        });

        await expect(sticker_publish_acquired_service(classroomId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockRejectedValueOnce(new Error("Unexpected error"));

        await expect(sticker_publish_acquired_service(classroomId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});