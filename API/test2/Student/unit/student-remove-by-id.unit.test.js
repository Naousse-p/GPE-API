const { student_remove_by_id_service } = require("../../../src/controllers/student/services");
const { Student } = require("../../../src/models");
const { deleteItem, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");
jest.mock("path");

describe("student_remove_by_id_service", () => {
    const studentId = "valid-student-id";
    const req = {
        userId: "valid-user-id",
    };

    const mockStudent = {
        _id: studentId,
        class: {
            professor: [{ user: { toString: () => "valid-user-id" } }],
        },
    };

    const mockFilePath = "/mocked/path/to/student_image.jpg";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete the student and image if the user has permission", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        path.join.mockReturnValueOnce(mockFilePath);
        fs.existsSync.mockReturnValueOnce(true);
        fs.unlinkSync.mockImplementationOnce(() => { });

        const result = await student_remove_by_id_service(studentId, req);

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
        expect(deleteItem).toHaveBeenCalledWith(Student, studentId);
        expect(result).toEqual({ message: "Student deleted successfully" });
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(student_remove_by_id_service(studentId, req)).rejects.toMatchObject({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        req.userId = "invalid-user-id"; 
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);

        await expect(student_remove_by_id_service(studentId, req)).rejects.toMatchObject({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });
});