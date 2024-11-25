const { parent_update_service } = require("../../../src/controllers/parent/services");
const { Parent, User } = require("../../../src/models");
const { getItemById, updateItem, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("parent_update_service", () => {
    const parentId = "valid-parent-id";
    const userId = "valid-user-id";
    const req = { userId };
    const mockParent = { _id: parentId, user: { toString: () => userId } };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the parent successfully without email change", async () => {
        const updateData = { firstname: "UpdatedFirstName", lastname: "UpdatedLastName" };
        isIDGood.mockResolvedValueOnce(parentId);
        getOneItem.mockResolvedValueOnce(mockParent);
        updateItem.mockResolvedValueOnce({ _id: parentId, ...updateData });

        const result = await parent_update_service(parentId, updateData, req);

        expect(isIDGood).toHaveBeenCalledWith(parentId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: parentId });
        expect(updateItem).toHaveBeenCalledWith(Parent, { _id: parentId }, { $set: updateData });
        expect(result).toEqual({ _id: parentId, ...updateData });
    });

    it("should update the parent and email successfully", async () => {
        const updateData = { email: "newemail@example.com", firstname: "UpdatedFirstName" };
        isIDGood.mockResolvedValueOnce(parentId);
        getOneItem.mockResolvedValueOnce(mockParent);
        getOneItem.mockResolvedValueOnce(null);
        updateItem.mockResolvedValueOnce({ _id: parentId, firstname: "UpdatedFirstName" });
        updateItem.mockResolvedValueOnce({ _id: userId, email: "newemail@example.com" });

        const result = await parent_update_service(parentId, updateData, req);

        expect(getOneItem).toHaveBeenCalledWith(User, { email: "newemail@example.com" });
        expect(updateItem).toHaveBeenCalledWith(User, { _id: userId }, { $set: { email: "newemail@example.com" } });
        expect(result).toEqual({ _id: parentId, firstname: "UpdatedFirstName" });
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        const invalidReq = { userId: "invalid-user-id" };
        isIDGood.mockResolvedValueOnce(parentId);
        getOneItem.mockResolvedValueOnce(mockParent);

        await expect(parent_update_service(parentId, {}, invalidReq)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(parentId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: parentId });
    });

    it("should throw a 404 error if the parent is not found", async () => {
        isIDGood.mockResolvedValueOnce(parentId);
        getOneItem.mockResolvedValueOnce(null); 

        await expect(parent_update_service(parentId, {}, req)).rejects.toEqual({
            code: 404,
            message: "Parent not found",
        });

        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: parentId });
    });

    it("should throw a 422 error if no data to update", async () => {
        const updateData = {};
        isIDGood.mockResolvedValueOnce(parentId);
        getOneItem.mockResolvedValueOnce(mockParent);

        await expect(parent_update_service(parentId, updateData, req)).rejects.toEqual({
            code: 422,
            message: "No data to update",
        });

        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: parentId });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(unexpectedError);

        await expect(parent_update_service(parentId, {}, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});