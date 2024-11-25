const { Class, School } = require("../../../src/models");
const { getItemById, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { classroom_by_school_service } = require("../../../src/controllers/classroom/services");

jest.mock("../../../src/models", () => ({
    Class: {},
    School: {}
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("classroom_by_school_service", () => {
    const req = { userId: "professor1" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return classrooms when the user has access to the school", async () => {
        const mockSchool = {
            _id: "school1",
            name: "School A",
            professor: [{ user: "professor1" }]
        };

        const mockClassrooms = [
            { _id: "class1", name: "Class A", professor: [{ user: "professor1" }] },
            { _id: "class2", name: "Class B", professor: [{ user: "professor2" }] }
        ];

        isIDGood.mockReturnValue(true);
        getItemById.mockResolvedValueOnce(mockSchool);
        getItems.mockResolvedValueOnce(mockClassrooms);

        const result = await classroom_by_school_service("school1", req);

        expect(isIDGood).toHaveBeenCalledWith("school1");
        expect(getItemById).toHaveBeenCalledWith(School, "school1", "professor");
        expect(getItems).toHaveBeenCalledWith(Class, { school: "school1" }, "professor");
        expect(result).toEqual(mockClassrooms);
    });

    it("should throw an error if the school is not found", async () => {
        isIDGood.mockReturnValue(true);

        getItemById.mockResolvedValueOnce(null);

        await expect(classroom_by_school_service("school1", req)).rejects.toEqual({
            code: 404,
            message: "School not found",
        });

        expect(getItemById).toHaveBeenCalledWith(School, "school1", "professor");
    });

    it("should throw an error if the user does not have access to the school", async () => {
        const mockSchool = {
            _id: "school1",
            name: "School A",
            professor: [{ user: "professor2" }]
        };

        isIDGood.mockReturnValue(true);
        getItemById.mockResolvedValueOnce(mockSchool);

        await expect(classroom_by_school_service("school1", req)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this school",
        });

        expect(getItemById).toHaveBeenCalledWith(School, "school1", "professor");
    });

    it("should throw an error if the school ID is invalid", async () => {
        isIDGood.mockImplementation(() => {
            throw { code: 400, message: "Invalid ID format" };
        });

        await expect(classroom_by_school_service("invalid-id", req)).rejects.toEqual({
            code: 400,
            message: "Invalid ID format",
        });

        expect(isIDGood).toHaveBeenCalledWith("invalid-id");
        expect(getItemById).not.toHaveBeenCalled();
    });
});