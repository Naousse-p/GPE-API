const { professor_by_class_service } = require("../../../src/controllers/professor/services");
const { Class } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("professor_by_class_service", () => {
    const classId = "valid-class-id";
    const req = { userId: "valid-user-id" };
    const mockClass = {
        _id: classId,
        professor: [{ user: { toString: () => "valid-user-id" } }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the list of professors for the class", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);

        const result = await professor_by_class_service(classId, req);

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, { path: "professor" });
        expect(result).toEqual(mockClass.professor);
    });

    it("should throw a 404 error if the class does not exist", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(professor_by_class_service(classId, req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });
    });

    it("should throw a 403 error if the user cannot access the class", async () => {
        const reqInvalid = { userId: "invalid-user-id" };
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);

        await expect(professor_by_class_service(classId, reqInvalid)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this class",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(unexpectedError);

        await expect(professor_by_class_service(classId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});