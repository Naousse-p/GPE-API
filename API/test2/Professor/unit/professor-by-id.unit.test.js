const { professor_by_id_service } = require("../../../src/controllers/professor/services");
const { Professor } = require("../../../src/models");
const { getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("professor_by_id_service", () => {
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString() };
    const mockProfessor = {
        _id: "professor-id",
        user: userId,
        firstname: "John",
        lastname: "Doe",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the professor if the user has access", async () => {
        isIDGood.mockResolvedValueOnce(userId);
        getOneItem.mockResolvedValueOnce(mockProfessor);

        const result = await professor_by_id_service(userId, req);
        console.log(result)
        expect(isIDGood).toHaveBeenCalledWith(userId);
        expect(getOneItem).toHaveBeenCalledWith(Professor, { user: userId });
        expect(result).toEqual(mockProfessor);
    });

    it("should throw a 404 error if the professor is not found", async () => {
        isIDGood.mockResolvedValueOnce(userId);
        getOneItem.mockResolvedValueOnce(null);

        await expect(professor_by_id_service(userId, req)).rejects.toEqual({
            code: 404,
            message: "Professor not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(userId);
        expect(getOneItem).toHaveBeenCalledWith(Professor, { user: userId });
    });

    it("should throw a 403 error if the user does not have access", async () => {
        const reqInvalid = { userId: "invalid-user-id" };
        isIDGood.mockResolvedValueOnce(userId);
        getOneItem.mockResolvedValueOnce(mockProfessor);

        await expect(professor_by_id_service(userId, reqInvalid)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this professor",
        });

        expect(isIDGood).toHaveBeenCalledWith(userId);
        expect(getOneItem).toHaveBeenCalledWith(Professor, { user: userId });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(unexpectedError);

        await expect(professor_by_id_service(userId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});