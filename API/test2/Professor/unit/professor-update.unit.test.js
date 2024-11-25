const { professor_update_service } = require("../../../src/controllers/professor/services");
const { Professor, User } = require("../../../src/models");
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

describe("professor_update_service", () => {
    const professorId = "valid-professor-id";
    const userId = "valid-user-id";
    const req = { userId };
    const mockProfessor = {
        _id: professorId,
        user: { toString: () => userId },
        firstname: "John",
        lastname: "Doe",
        phoneNumber: "123456789",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the professor successfully", async () => {
        isIDGood.mockResolvedValueOnce(professorId);
        getOneItem.mockResolvedValueOnce(mockProfessor);
        const updatedData = { firstname: "Jane", lastname: "Doe", phoneNumber: "987654321" };
        updateItem.mockResolvedValueOnce({ ...mockProfessor, ...updatedData });

        const result = await professor_update_service(professorId, updatedData, req);

        expect(isIDGood).toHaveBeenCalledWith(professorId);
        expect(getOneItem).toHaveBeenCalledWith(Professor, { user: professorId });
        expect(updateItem).toHaveBeenCalledWith(Professor, { _id: professorId }, { $set: updatedData });
        expect(result).toEqual({ ...mockProfessor, ...updatedData });
    });

    it("should throw a 404 error if the professor is not found", async () => {
        isIDGood.mockResolvedValueOnce(professorId);
        getOneItem.mockResolvedValueOnce(null);

        await expect(professor_update_service(professorId, {}, req)).rejects.toEqual({
            code: 404,
            message: "Professor not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(professorId);
        expect(getOneItem).toHaveBeenCalledWith(Professor, { user: professorId });
    });

    it("should throw a 403 error if the user does not have access to the professor", async () => {
        const reqInvalid = { userId: "another-user-id" };
        isIDGood.mockResolvedValueOnce(professorId);
        getOneItem.mockResolvedValueOnce(mockProfessor);

        await expect(professor_update_service(professorId, {}, reqInvalid)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this professor",
        });

        expect(isIDGood).toHaveBeenCalledWith(professorId);
        expect(getOneItem).toHaveBeenCalledWith(Professor, { user: professorId });
    });

    it("should throw a 422 error if there is no data to update", async () => {
        isIDGood.mockResolvedValueOnce(professorId);
        getOneItem.mockResolvedValueOnce(mockProfessor);

        await expect(professor_update_service(professorId, {}, req)).rejects.toEqual({
            code: 422,
            message: "No data to update",
        });

        expect(isIDGood).toHaveBeenCalledWith(professorId);
        expect(getOneItem).toHaveBeenCalledWith(Professor, { user: professorId });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(unexpectedError);

        await expect(professor_update_service(professorId, {}, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});