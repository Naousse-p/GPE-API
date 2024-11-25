const { sticker_create_service } = require("../../../src/controllers/sticker/services/sticker-create.service");
const { Sticker, Class } = require("../../../src/models");
const { getOneItem, createItem, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../src/utils/multer");
const crypto = require("crypto");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
    createItem: jest.fn(),
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/multer", () => ({
    saveSourceFile: jest.fn(),
}));

describe("sticker_create_service", () => {
    const classId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const mockClass = {
        _id: classId,
        professor: [{ user: userId }],
    };

    const req = {
        userId: userId.toString(),
        file: { buffer: Buffer.from("file content") },
    };

    const name = "Test Sticker";
    const description = "This is a test sticker";
    const category = "fun";
    const md5Hash = crypto.createHash("md5").update(req.file.buffer + name + classId).digest("hex");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new sticker successfully", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getOneItem.mockResolvedValueOnce(null);
        createItem.mockResolvedValueOnce({ name, description, category });

        const createdSticker = { name, description, category };
        saveSourceFile.mockResolvedValueOnce("/uploads/sticker.jpg");
        createItem.mockResolvedValueOnce(createdSticker);

        const result = await sticker_create_service(name, description, category, classId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(classId.toString());
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor");
        expect(getOneItem).toHaveBeenCalledWith(Sticker, { md5: md5Hash, name });
        expect(saveSourceFile).toHaveBeenCalledWith(req.file.buffer, expect.any(mongoose.Types.ObjectId), "sticker", "jpg", false);
        expect(createItem).toHaveBeenCalledWith(Sticker, expect.any(Object));
        expect(result).toEqual(createdSticker);
    });

    it("should throw a 422 error if no file is provided", async () => {
        const reqWithoutFile = { ...req, file: undefined };
        await expect(sticker_create_service(name, description, category, classId.toString(), reqWithoutFile)).rejects.toEqual({
            code: 422,
            message: "Source file is required",
        });
    });

    it("should throw a 404 error if class is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_create_service(name, description, category, classId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });
    });

    it("should throw a 403 error if user does not have permission for the class", async () => {
        const otherUserId = new mongoose.Types.ObjectId();
        const mockClassWithOtherProfessor = {
            _id: classId,
            professor: [{ user: otherUserId }],
        };

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClassWithOtherProfessor);

        await expect(sticker_create_service(name, description, category, classId.toString(), req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 409 error if sticker already exists", async () => {
        const existingSticker = { _id: new mongoose.Types.ObjectId(), name, md5: md5Hash };
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getOneItem.mockResolvedValueOnce(existingSticker);

        await expect(sticker_create_service(name, description, category, classId.toString(), req)).rejects.toEqual({
            code: 409,
            message: "Sticker already exists",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockRejectedValueOnce(new Error("Unexpected Error"));

        await expect(sticker_create_service(name, description, category, classId.toString(), req)).rejects.toEqual({
            code: 500,
            message: "Unexpected Error",
        });
    });
});