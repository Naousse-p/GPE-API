const { student_by_id_service } = require("../../../src/controllers/student/services");
const { Student } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("student_by_id_service", () => {
    const studentId = "valid-student-id";
    const mockStudent = {
        _id: studentId,
        name: "John Doe",
        class: {
            _id: "class-id",
            name: "Class 1",
            professor: [{ _id: "prof-id", user: "prof-user-id" }],
        },
        parent: [{ _id: "parent-id", user: "parent-user-id" }],
    };
    const req = {
        userId: "parent-user-id",
        role: ["parents"],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the student if found by ID and the user has access as a parent", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);

        const result = await student_by_id_service(studentId, req);

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, [{ path: "class", populate: { path: "professor" } }, "parent"]);
        expect(result).toEqual(mockStudent);
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(student_by_id_service(studentId, req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });
    });

    it("should throw a 403 error if the user does not have access to the student", async () => {
        const reqWithoutAccess = {
            userId: "unauthorized-user-id",
            role: ["parents"],
        };
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);

        await expect(student_by_id_service(studentId, reqWithoutAccess)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 500 error if an unexpected error occurs", async () => {
        const error = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(error);

        await expect(student_by_id_service(studentId, req)).rejects.toEqual({
            code: 500,
            message: error.message,
        });
    });
});