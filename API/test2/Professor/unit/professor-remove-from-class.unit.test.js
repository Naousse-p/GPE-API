const { professor_remove_from_class_service } = require("../../../src/controllers/professor/services");
const { Class, Professor } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("professor_remove_from_class_service", () => {
    const classId = "valid-class-id";
    const professorId = "valid-professor-id";
    const req = { userId: "valid-user-id" };

    const mockClass = {
        _id: classId,
        professor: [
            { _id: "professor-id-1", user: { toString: () => "valid-user-id" } },
            { _id: "professor-id-2", user: { toString: () => "another-user-id" } },
        ],
        save: jest.fn(),
    };

    const mockProfessor = {
        _id: professorId,
        user: { toString: () => "valid-user-id" },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove the professor from the class successfully", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        isIDGood.mockResolvedValueOnce(professorId);
        getItemById.mockResolvedValueOnce(mockClass);
        getItemById.mockResolvedValueOnce(mockProfessor);

        const result = await professor_remove_from_class_service(classId, professorId, req);

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(isIDGood).toHaveBeenCalledWith(professorId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, { path: "professor" });
        expect(getItemById).toHaveBeenCalledWith(Professor, professorId);
        expect(mockClass.save).toHaveBeenCalled();
        expect(result).toEqual(mockClass.professor);
    });

    it("should throw a 404 error if the class is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(professor_remove_from_class_service(classId, professorId, req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });
    });

    it("should throw a 404 error if the professor is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getItemById.mockResolvedValueOnce(null);

        await expect(professor_remove_from_class_service(classId, professorId, req)).rejects.toEqual({
            code: 404,
            message: "Professor not found",
        });
    });

    it("should throw a 403 error if the user does not have access to the class", async () => {
        const reqInvalid = { userId: "invalid-user-id" };
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getItemById.mockResolvedValueOnce(mockProfessor);

        await expect(professor_remove_from_class_service(classId, professorId, reqInvalid)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this class",
        });
    });

    it("should throw a 403 error if the user does not have access to the professor", async () => {
        const reqInvalid = { userId: "invalid-user-id" };
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getItemById.mockResolvedValueOnce(mockProfessor);

        await expect(professor_remove_from_class_service(classId, professorId, reqInvalid)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this class",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(unexpectedError);

        await expect(professor_remove_from_class_service(classId, professorId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});