const { parent_remove_from_class_service } = require("../../../src/controllers/parent/services");
const { Parent, Class, Student } = require("../../../src/models");
const { getItemById, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/models", () => ({
    Class: {
        findByIdAndUpdate: jest.fn(),
    },
    Student: {
        updateMany: jest.fn(),
    },
}));

describe("parent_remove_from_class_service", () => {
    const parentId = "valid-parent-id";
    const classId = "valid-class-id";
    const req = { userId: "professor-id" };

    const mockParent = {
        _id: parentId,
        children: [{ child: "valid-child-id", class: { professor: [{ user: "professor-id" }] } }],
    };

    const mockClass = {
        _id: classId,
        children: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove the parent from the class and associated students", async () => {
        isIDGood.mockResolvedValueOnce(parentId);
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getOneItem.mockResolvedValueOnce(mockParent);

        await parent_remove_from_class_service(parentId, classId, req);

        expect(isIDGood).toHaveBeenCalledWith(parentId);
        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { _id: parentId, "children.class": classId }, { path: "children", populate: [{ path: "child" }, { path: "class", populate: { path: "professor" } }] });
        expect(Class.findByIdAndUpdate).toHaveBeenCalledWith(classId, { $pull: { "children.$[elem].parents": parentId } }, { arrayFilters: [{ "elem.child": "valid-child-id" }] });
        expect(Student.updateMany).toHaveBeenCalledWith({ _id: { $in: ["valid-child-id"] } }, { $pull: { parent: parentId } });
    });

    it("should throw a 404 error if the class is not found", async () => {
        isIDGood.mockResolvedValueOnce(parentId);
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(parent_remove_from_class_service(parentId, classId, req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });

        expect(getItemById).toHaveBeenCalledWith(Class, classId);
    });

    it("should throw a 404 error if the parent is not found", async () => {
        isIDGood.mockResolvedValueOnce(parentId);
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getOneItem.mockResolvedValueOnce(null); 

        await expect(parent_remove_from_class_service(parentId, classId, req)).rejects.toEqual({
            code: 404,
            message: "Parent not found",
        });

        expect(getOneItem).toHaveBeenCalledWith(Parent, { _id: parentId, "children.class": classId }, { path: "children", populate: [{ path: "child" }, { path: "class", populate: { path: "professor" } }] });
    });

    it("should throw a 403 error if the user doesn't have permission", async () => {
        const invalidReq = { userId: "invalid-professor-id" };
        isIDGood.mockResolvedValueOnce(parentId);
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getOneItem.mockResolvedValueOnce(mockParent);

        await expect(parent_remove_from_class_service(parentId, classId, invalidReq)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(unexpectedError);

        await expect(parent_remove_from_class_service(parentId, classId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});