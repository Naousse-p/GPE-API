const { sticker_book_generate_service } = require("../../../src/controllers/sticker-book/services");
const { Student, AcquiredSticker } = require("../../../src/models");
const { generatePDF } = require("../../../src/controllers/sticker-book/helpers/pdfGenerator");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const RabbitMQService = require("../../../src/config/rabbitMqService.config");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/controllers/sticker-book/helpers/pdfGenerator", () => ({
    generatePDF: jest.fn(),
}));

jest.mock("../../../src/config/rabbitMqService.config", () => ({
    publishMessage: jest.fn(),
}));

jest.mock("fs");
jest.mock("path");

describe("sticker_book_generate_service", () => {
    const studentId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString(), role: ["parents"] };
    const res = {};  // Empty mock response object
    const mockStudent = {
        _id: studentId,
        firstname: "John",
        lastname: "Doe",
        class: { professor: [{ user: userId }] },
    };
    const mockAcquiredStickers = [
        { sticker: { _id: new mongoose.Types.ObjectId(), isPublished: true } },
        { sticker: { _id: new mongoose.Types.ObjectId(), isPublished: true } },
    ];
    const mockPDFBuffer = Buffer.from("mock pdf data");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should generate and return the sticker book PDF for the student", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        AcquiredSticker.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockAcquiredStickers),
        });
        generatePDF.mockResolvedValue(mockPDFBuffer);

        const result = await sticker_book_generate_service(studentId.toString(), req, res);

        expect(isIDGood).toHaveBeenCalledWith(studentId.toString());
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
        expect(generatePDF).toHaveBeenCalledWith(mockStudent, mockAcquiredStickers, expect.any(Function), req);
        expect(RabbitMQService.publishMessage).toHaveBeenCalledWith({ fileName: "John_Doe.pdf" });
        expect(result).toEqual(mockPDFBuffer);
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(sticker_book_generate_service(studentId.toString(), req, res)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });
});