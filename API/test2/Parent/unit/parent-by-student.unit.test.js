const { parent_by_student_service } = require("../../../src/controllers/parent/services");
const { Parent, Student } = require("../../../src/models");
const { getItemById, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("parent_by_student_service", () => {
    const studentId = "valid-student-id";
    const req = { userId: "valid-user-id", role: ["parent"] };
    const mockStudent = {
        _id: studentId,
        class: {
            professor: [{ user: "valid-professor-id" }],
        },
        parents: [{ user: req.userId }],
    };
    const mockParents = [
        { _id: "parent1", children: ["child1"] },
        { _id: "parent2", children: ["child2"] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the list of parents with children linked to the student", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);
        getItems.mockResolvedValueOnce(mockParents);

        const result = await parent_by_student_service(studentId, req);

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
        expect(getItems).toHaveBeenCalledWith(Parent, { children: { $elemMatch: { child: studentId } } });
        expect(result).toEqual(mockParents);
    });

    it("should throw a 404 error if the student is not found", async () => {
        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(null);

        await expect(parent_by_student_service(studentId, req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
    });

    it("should throw a 403 error if the user does not have permission as a parent", async () => {
        const reqWithoutPermission = { userId: "other-parent-id", role: ["parent"] };

        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);

        await expect(parent_by_student_service(studentId, reqWithoutPermission)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
    });

    it("should throw a 403 error if the user does not have permission as a professor", async () => {
        const reqProfessorWithoutPermission = { userId: "other-professor-id", role: ["professor"] };

        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockResolvedValueOnce(mockStudent);

        await expect(parent_by_student_service(studentId, reqProfessorWithoutPermission)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");

        isIDGood.mockResolvedValueOnce(studentId);
        getItemById.mockRejectedValueOnce(unexpectedError);

        await expect(parent_by_student_service(studentId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(getItemById).toHaveBeenCalledWith(Student, studentId, { path: "class", populate: { path: "professor" } });
    });
});