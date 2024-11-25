const { sticker_assigned_picture_service } = require("../../../src/controllers/sticker-assigned/services");
const { AcquiredSticker } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");

describe("sticker_assigned_picture_service", () => {
    const userId = new mongoose.Types.ObjectId();
    const assignedStickerId = new mongoose.Types.ObjectId();
    const mockAssignedSticker = {
        _id: assignedStickerId,
        student: {
            _id: new mongoose.Types.ObjectId(),
            class: {
                _id: new mongoose.Types.ObjectId(),
                professor: [{ user: userId }],
            },
            parent: [{ user: userId }],
        },
    };
    const req = { userId: userId.toString(), role: ["professor"] };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the assigned sticker image file buffer", async () => {
        const filePath = "path/to/image.jpg";
        const fileBuffer = Buffer.from("fake image data");

        isIDGood.mockResolvedValueOnce(assignedStickerId);
        getItemById.mockResolvedValueOnce(mockAssignedSticker);
        fs.existsSync.mockReturnValueOnce(true);
        fs.readFileSync.mockReturnValueOnce(fileBuffer);

        const result = await sticker_assigned_picture_service(assignedStickerId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(assignedStickerId.toString());
        expect(getItemById).toHaveBeenCalledWith(AcquiredSticker, assignedStickerId, {
            path: "student",
            populate: [
                { path: "class", populate: { path: "professor" } },
                { path: "parent" },
            ],
        });
        expect(result).toEqual(fileBuffer);
    });

    it("should throw a 404 error if the assigned sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(assignedStickerId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_assigned_picture_service(assignedStickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Acquired sticker not found",
        });
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        const mockOtherUserId = new mongoose.Types.ObjectId();
        const reqOtherUser = { userId: mockOtherUserId.toString(), role: ["professor"] };

        isIDGood.mockResolvedValueOnce(assignedStickerId);
        getItemById.mockResolvedValueOnce(mockAssignedSticker);

        await expect(sticker_assigned_picture_service(assignedStickerId.toString(), reqOtherUser)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 404 error if the image file is not found", async () => {
        isIDGood.mockResolvedValueOnce(assignedStickerId);
        getItemById.mockResolvedValueOnce(mockAssignedSticker);
        fs.existsSync.mockReturnValueOnce(false);

        await expect(sticker_assigned_picture_service(assignedStickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Image not found",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockRejectedValueOnce(new Error("Unexpected error"));

        await expect(sticker_assigned_picture_service(assignedStickerId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});