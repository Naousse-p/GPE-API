const { professor_by_school_service } = require("../../../src/controllers/professor/services");
const { School } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("professor_by_school_service", () => {
    const schoolId = new mongoose.Types.ObjectId();;
    const req = { userId: "valid-user-id" };
    const mockSchool = {
        _id: schoolId,
        name: "Test School",
        professor: [
            { user: { toString: () => "valid-user-id" } },
            { user: { toString: () => "another-user-id" } },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // it("should return the professors of the school if the user has access", async () => {
    //     isIDGood.mockResolvedValueOnce(schoolId);
    //     getItemById.mockResolvedValueOnce(mockSchool);

    //     const result = await professor_by_school_service(schoolId, req);

    //     expect(isIDGood).toHaveBeenCalledWith(schoolId);
    //     expect(getItemById).toHaveBeenCalledWith(School, schoolId, { path: "professor" });
    //     expect(result).toEqual({
    //         schoolName: "Test School",
    //         professor: mockSchool.professor,
    //     });
    // });

    it("should throw a 404 error if the school does not exist", async () => {
        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(null);

        await expect(professor_by_school_service(schoolId, req)).rejects.toEqual({
            code: 404,
            message: "School not found",
        });
    });

    it("should throw a 403 error if the user cannot access the school", async () => {
        const reqInvalid = { userId: "invalid-user-id" };
        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(mockSchool);

        await expect(professor_by_school_service(schoolId, reqInvalid)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this school",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const unexpectedError = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(unexpectedError);

        await expect(professor_by_school_service(schoolId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });
    });
});