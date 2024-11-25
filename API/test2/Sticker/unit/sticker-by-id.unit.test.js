const { sticker_by_id_service } = require("../../../src/controllers/sticker/services/sticker-by-id.service");
const { Sticker } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("sticker_by_id_service", () => {
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

    it("should return the sticker if user has permission", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(mockSticker);

        const result = await sticker_by_id_service(stickerId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(stickerId.toString());
        expect(getItemById).toHaveBeenCalledWith(Sticker, stickerId, { path: "class", populate: { path: "professor" } });
        expect(result).toEqual(mockSticker);
    });

    it("should throw a 404 error if sticker is not found", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_by_id_service(stickerId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Sticker not found",
        });
    });

    it("should throw a 403 error if user does not have permission for the sticker", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        const mockClassWithOtherUser = {
            _id: new mongoose.Types.ObjectId(),
            professor: [{ user: otherUserId }],
        };

        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockResolvedValueOnce({ ...mockSticker, class: [mockClassWithOtherUser] });

        await expect(sticker_by_id_service(stickerId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockResolvedValueOnce(stickerId);
        getItemById.mockRejectedValueOnce(new Error("Unexpected Error"));

        await expect(sticker_by_id_service(stickerId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected Error",
        });
    });
});