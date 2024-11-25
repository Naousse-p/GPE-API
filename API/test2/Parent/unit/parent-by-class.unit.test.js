const { parent_by_class_service } = require("../../../src/controllers/parent/services");
const { Class, Parent, Student } = require("../../../src/models");
const { getItemById, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("parent_by_class_service", () => {
    const classId = "valid-class-id";
    const req = { userId: "valid-professor-id" };
    const mockClass = {
        _id: classId,
        professor: [{ user: req.userId }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a list of parents with their children for a valid class", async () => {
        const mockStudents = [
            { _id: "student1", parent: ["parent1"] },
            { _id: "student2", parent: ["parent2"] },
        ];

        const mockParents = [
            { _id: "parent1", children: ["student1"] },
            { _id: "parent2", children: ["student2"] },
        ];

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getItems.mockResolvedValueOnce(mockStudents);
        getItems.mockResolvedValueOnce(mockParents);

        const result = await parent_by_class_service(classId, req);

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor");
        expect(getItems).toHaveBeenCalledWith(Student, { class: classId });
        expect(getItems).toHaveBeenCalledWith(Parent, { _id: { $in: ["parent1", "parent2"] } }, { path: "children", populate: { path: "child" } });
        expect(result).toEqual(mockParents);
    });

    it("should throw a 404 error if the class is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(parent_by_class_service(classId, req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor");
        expect(getItems).not.toHaveBeenCalled();
    });

    it("should throw a 403 error if the user does not have permission for the class", async () => {
        const mockClassWithoutPermission = {
            _id: classId,
            professor: [{ user: "another-professor-id" }],
        };

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClassWithoutPermission);

        await expect(parent_by_class_service(classId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor");
        expect(getItems).not.toHaveBeenCalled();
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockRejectedValueOnce(unexpectedError);

        await expect(parent_by_class_service(classId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor");
    });
});