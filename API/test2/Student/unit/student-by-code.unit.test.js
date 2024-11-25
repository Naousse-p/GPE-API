const { student_by_code_service } = require("../../../src/controllers/student/services");
const { Student } = require("../../../src/models");
const { getOneItem } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
}));

describe("student_by_code_service", () => {
    const studentCode = "STUDENT123";
    const mockStudent = {
        _id: "student-id",
        name: "John Doe",
        code: studentCode,
        class: {
            _id: "class-id",
            name: "Class 1",
            professor: [{ _id: "prof-id", user: "prof-user-id" }],
        },
        parent: [{ _id: "parent-id", user: "parent-user-id" }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the student if found by code", async () => {
        getOneItem.mockResolvedValueOnce(mockStudent);

        const result = await student_by_code_service(studentCode, {});

        expect(getOneItem).toHaveBeenCalledWith(Student, { code: studentCode }, [{ path: "class", populate: { path: "professor" } }, "parent"]);
        expect(result).toEqual(mockStudent);
    });

    it("should throw a 404 error if the student is not found", async () => {
        getOneItem.mockResolvedValueOnce(null);

        await expect(student_by_code_service(studentCode, {})).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 500 error if an unexpected error occurs", async () => {
        const error = new Error("Unexpected error");
        getOneItem.mockRejectedValueOnce(error);

        await expect(student_by_code_service(studentCode, {})).rejects.toEqual({
            code: 500,
            message: error.message,
        });
    });
});