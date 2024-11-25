const { sticker_picture_service } = require("../../../src/controllers/sticker/services");
const { Sticker, Parent } = require("../../../src/models");
const { getItemById, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs", () => ({
    readFileSync: jest.fn(),
    existsSync: jest.fn(),
}));

describe("sticker_picture_service", () => {
    const stickerId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const mockClass = {
        _id: new mongoose.Types.ObjectId(),
        professor: [{ user: userId }],
    };

    const mockSticker = {
        _id: stickerId,
        class: [mockClass],
    };

    const req = {
        userId: userId.toString(),
        role: ["professor"],
    };

    const filePath = `/uploads/sticker/${stickerId}_source.jpg`;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the sticker image file successfully", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);
        fs.existsSync.mockReturnValueOnce(true);
        fs.readFileSync.mockReturnValueOnce(Buffer.from("file content"));

        const result = await sticker_picture_service(stickerId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(stickerId.toString());
        expect(getItemById).toHaveBeenCalledWith(Sticker, stickerId, { path: "class", populate: { path: "professor" } });
        expect(result).toEqual(Buffer.from("file content"));
    });

    it("should throw a 404 error if the sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_picture_service(stickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Sticker not found",
        });
    });

    it("should throw a 404 error if the image file is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);
        fs.existsSync.mockReturnValueOnce(false);

        await expect(sticker_picture_service(stickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Image not found",
        });
    });
});