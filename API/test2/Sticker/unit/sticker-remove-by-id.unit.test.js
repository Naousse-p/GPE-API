const { sticker_remove_by_id_service } = require("../../../src/controllers/sticker/services");
const { Sticker } = require("../../../src/models");
const { deleteItem, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    deleteItem: jest.fn(),
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs", () => ({
    existsSync: jest.fn(),
    unlinkSync: jest.fn(),
}));

describe("sticker_remove_by_id_service", () => {
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
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete the sticker successfully", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);
        fs.existsSync.mockReturnValueOnce(true);

        const result = await sticker_remove_by_id_service(stickerId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(stickerId.toString());
        expect(getItemById).toHaveBeenCalledWith(Sticker, stickerId, { path: "class", populate: { path: "professor" } });
        expect(deleteItem).toHaveBeenCalledWith(Sticker, stickerId);
        expect(result).toEqual({ message: "Sticker deleted successfully" });
    });

    it("should throw a 404 error if the sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_remove_by_id_service(stickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Sticker not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to delete the sticker", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);

        const reqWithNoPermission = { ...req, userId: otherUserId.toString() };

        await expect(sticker_remove_by_id_service(stickerId.toString(), reqWithNoPermission)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should delete the sticker image if it exists", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);
        fs.existsSync.mockReturnValueOnce(true);

        await sticker_remove_by_id_service(stickerId.toString(), req);

        expect(fs.existsSync).toHaveBeenCalledWith(path.join(__dirname, "../../../..", "API/uploads/sticker", `${stickerId}_source.jpg`));
        expect(fs.unlinkSync).toHaveBeenCalledWith(path.join(__dirname, "../../../..", "API/uploads/sticker", `${stickerId}_source.jpg`));
    });

    it("should not delete the sticker image if it does not exist", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);
        fs.existsSync.mockReturnValueOnce(false);

        await sticker_remove_by_id_service(stickerId.toString(), req);

        expect(fs.existsSync).toHaveBeenCalledWith(path.join(__dirname, "../../../..", "API/uploads/sticker", `${stickerId}_source.jpg`));
        expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
});