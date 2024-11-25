const { student_picture_service } = require("../../../src/controllers/student/services");
const { Student } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");
jest.mock("path");

describe("student_picture_service", () => {
    const studentId = "valid-student-id";
    const req = {
        userId: "valid-user-id",
        role: ["professor"],
    };

    const mockStudent = {
        _id: studentId,
        class: {
            professor: [{ user: { toString: () => "valid-user-id" } }],
        },
        parent: [{ user: { toString: () => "valid-parent-id" } }],
    };

    const mockFilePath = "/mocked/path/to/student_image.jpg";
    const mockFileBuffer = Buffer.from("mocked file data");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the student picture if the user is a professor with permission", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        path.join.mockReturnValueOnce(mockFilePath);
        fs.existsSync.mockReturnValueOnce(true);
        fs.readFileSync.mockReturnValueOnce(mockFileBuffer);

        const result = await student_picture_service(studentId, req);

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(result).toEqual(mockFileBuffer);
    });

    it("should throw 404 error if student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(student_picture_service(studentId, req)).rejects.toMatchObject({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw 404 error if the image is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        path.join.mockReturnValueOnce(mockFilePath);
        fs.existsSync.mockReturnValueOnce(false);

        await expect(student_picture_service(studentId, req)).rejects.toMatchObject({
            code: 404,
            message: "Image not found",
        });
    });

    it("should throw 500 error for unexpected errors", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        path.join.mockReturnValueOnce(mockFilePath);
        fs.existsSync.mockReturnValueOnce(true);
        fs.readFileSync.mockImplementationOnce(() => {
            throw new Error("Unexpected error");
        });

        await expect(student_picture_service(studentId, req)).rejects.toMatchObject({
            code: 500,
            message: "Unexpected error",
        });
    });
});