const { student_update_service } = require("../../../src/controllers/student/services");
const { Student } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../src/utils/multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

jest.mock("fs");
jest.mock("crypto");

describe("student_update_service", () => {
    const studentId = "valid-student-id";
    const reqSuccess = {
        userId: "valid-user-id",
    };
    const req = {
        userId: "valid-user-id",
        file: { buffer: Buffer.from("fake-file-content") },
    };

    const mockStudent = {
        _id: studentId,
        firstname: "John",
        lastname: "Doe",
        class: {
            professor: [{ user: { toString: () => "valid-user-id" } }],
        },
        source: "existing_image.jpg",
    };

    const updatedDataSuccess = {
        firstname: "Jane",
        lastname: "Doe",
    };

    const updatedData = {
        firstname: "Jane",
        lastname: "Doe",
        birthdate: "2000-01-01",
        sexe: "female",
        level: "A",
        classId: "new-class-id",
    };

    const mockFilePath = "/mocked/path/to/student_image.jpg";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the student successfully", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        saveSourceFile.mockResolvedValueOnce(mockFilePath);
        crypto.createHash.mockReturnValueOnce({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValueOnce("mock-md5-hash"),
        });

        updateItem.mockResolvedValueOnce({
            firstname: "Jane",
            lastname: "Doe",
        });

        const result = await student_update_service(studentId, updatedData, reqSuccess);

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
        expect(result).toEqual(updatedDataSuccess);
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(student_update_service(studentId, updatedData, req)).rejects.toMatchObject({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to update the student", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce({
            ...mockStudent,
            class: {
                professor: [{ user: { toString: () => "another-user-id" } }],
            },
        });

        await expect(student_update_service(studentId, updatedData, req)).rejects.toMatchObject({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 409 error if a student with the same md5 already exists", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        crypto.createHash.mockReturnValueOnce({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValueOnce("mock-md5-hash"),
        });
        Student.findOne = jest.fn().mockResolvedValueOnce({ _id: "existing-student-id" });

        await expect(student_update_service(studentId, updatedData, req)).rejects.toMatchObject({
            code: 409,
            message: "Student already exists",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockRejectedValueOnce(new Error("Unexpected error"));

        await expect(student_update_service(studentId, updatedData, req)).rejects.toMatchObject({
            code: 500,
            message: "Unexpected error",
        });
    });
});