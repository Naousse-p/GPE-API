const { parent_by_school_service } = require("../../../src/controllers/parent/services");
const { Parent, School, Student } = require("../../../src/models");
const { getItemById, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("parent_by_school_service", () => {
    const schoolId = "valid-school-id";
    const req = { userId: "valid-user-id" };
    const mockSchool = {
        _id: schoolId,
        professor: [{ user: req.userId }],
    };
    const mockParents = [
        { _id: "parent1", children: ["child1"] },
        { _id: "parent2", children: ["child2"] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the list of parents with children in the school", async () => {
        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(mockSchool);
        getItems.mockResolvedValueOnce([{ parent: "parent1" }, { parent: "parent2" }]);
        getItems.mockResolvedValueOnce(mockParents);

        const result = await parent_by_school_service(schoolId, req);

        expect(isIDGood).toHaveBeenCalledWith(schoolId);
        expect(getItemById).toHaveBeenCalledWith(School, schoolId, "professor");
        expect(getItems).toHaveBeenCalledWith(Student, { school: schoolId });
        expect(getItems).toHaveBeenCalledWith(Parent, { _id: { $in: ["parent1", "parent2"] } }, { path: "children", populate: { path: "child" } });
        expect(result).toEqual(mockParents);
    });

    it("should throw a 404 error if the school is not found", async () => {
        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(null);

        await expect(parent_by_school_service(schoolId, req)).rejects.toEqual({
            code: 404,
            message: "School not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(schoolId);
        expect(getItemById).toHaveBeenCalledWith(School, schoolId, "professor");
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        const mockSchoolWithoutPermission = {
            _id: schoolId,
            professor: [{ user: "other-user-id" }],
        };

        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(mockSchoolWithoutPermission);

        await expect(parent_by_school_service(schoolId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(schoolId);
        expect(getItemById).toHaveBeenCalledWith(School, schoolId, "professor");
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");

        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockRejectedValueOnce(unexpectedError);

        await expect(parent_by_school_service(schoolId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });

        expect(isIDGood).toHaveBeenCalledWith(schoolId);
        expect(getItemById).toHaveBeenCalledWith(School, schoolId, "professor");
    });
});