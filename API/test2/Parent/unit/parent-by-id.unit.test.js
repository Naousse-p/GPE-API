const { parent_by_id_service } = require("../../../src/controllers/parent/services");
const { Parent } = require("../../../src/models");
const { getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("parent_by_id_service", () => {
    const parentId = "valid-parent-id";
    const req = { userId: "valid-user-id" };
    const mockParent = {
        _id: parentId,
        user: req.userId,
        children: ["child1", "child2"],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the parent if the user has permission", async () => {
        isIDGood.mockResolvedValueOnce(parentId);
        getOneItem.mockResolvedValueOnce(mockParent);

        const result = await parent_by_id_service(parentId, req);

        expect(isIDGood).toHaveBeenCalledWith(parentId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: parentId }, { path: "children" });
        expect(result).toEqual(mockParent);
    });

    it("should throw a 404 error if the parent is not found", async () => {
        isIDGood.mockResolvedValueOnce(parentId);
        getOneItem.mockResolvedValueOnce(null);

        await expect(parent_by_id_service(parentId, req)).rejects.toEqual({
            code: 404,
            message: "Parent not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(parentId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: parentId }, { path: "children" });
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        const mockParentWithoutPermission = {
            _id: parentId,
            user: "another-user-id",
            children: ["child1", "child2"],
        };

        isIDGood.mockResolvedValueOnce(parentId);
        getOneItem.mockResolvedValueOnce(mockParentWithoutPermission);

        await expect(parent_by_id_service(parentId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(parentId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: parentId }, { path: "children" });
    });
});