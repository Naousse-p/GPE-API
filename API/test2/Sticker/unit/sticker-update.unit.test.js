const { sticker_update_service } = require("../../../src/controllers/sticker/services/sticker-update.service");
const { Sticker } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../src/utils/multer");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/multer", () => ({
    saveSourceFile: jest.fn(),
}));

Sticker.findOne = jest.fn();

describe("sticker_update_service", () => {
    const stickerId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const mockClass = {
        _id: new mongoose.Types.ObjectId(),
        professor: [{ user: userId }],
    };
    const mockSticker = {
        _id: stickerId,
        class: [mockClass],
        name: "Old Sticker",
        description: "Old Description",
        category: "Old Category",
        save: jest.fn(),
    };

    const req = {
        userId: userId.toString(),
        file: {
            buffer: Buffer.from("fileBuffer"),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the sticker successfully", async () => {
        const mockUpdatedSticker = {
            ...mockSticker,
            name: "New Sticker",
            description: "New Description",
            category: "New Category",
        };

        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);
        saveSourceFile.mockResolvedValueOnce("path/to/new/file");
        updateItem.mockResolvedValueOnce(mockUpdatedSticker);

        Sticker.findOne.mockResolvedValueOnce(null);

        const data = {
            name: "New Sticker",
            description: "New Description",
            category: "New Category",
        };

        const result = await sticker_update_service(stickerId.toString(), data, req);

        expect(isIDGood).toHaveBeenCalledWith(stickerId.toString());
        expect(result).toEqual(mockUpdatedSticker);
    });

    it("should throw a 404 error if the sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(null);

        const data = { name: "New Sticker" };

        await expect(sticker_update_service(stickerId.toString(), data, req)).rejects.toEqual({
            code: 404,
            message: "Sticker not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to update the sticker", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);

        const reqWithNoPermission = { ...req, userId: otherUserId.toString() };

        const data = { name: "New Sticker" };

        await expect(sticker_update_service(stickerId.toString(), data, reqWithNoPermission)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 422 error if no data to update", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);

        const emptyData = {};

        await expect(sticker_update_service(stickerId.toString(), emptyData, { ...req, file: null })).rejects.toEqual({
            code: 422,
            message: "No data to update",
        });
    });

    it("should throw a 409 error if the sticker already exists", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);

        Sticker.findOne.mockResolvedValueOnce(mockSticker);

        const data = { name: "New Sticker" };

        await expect(sticker_update_service(stickerId.toString(), data, req)).rejects.toEqual({
            code: 409,
            message: "Sticker already exists",
        });
    });
});