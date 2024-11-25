const { Class } = require("../../../src/models");
const { getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { classroom_by_code_service } = require("../../../src/controllers/classroom/services");

jest.mock("../../../src/models", () => ({
    Class: {}
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
}));

describe("classroom_by_code_service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the classroom when found", async () => {
        const mockClassroom = { _id: "class1", name: "Class A", code: "CLASSA" };

        getOneItem.mockResolvedValueOnce(mockClassroom);

        const result = await classroom_by_code_service("CLASSA");

        expect(getOneItem).toHaveBeenCalledWith(Class, { code: "CLASSA" });
        expect(result).toEqual(mockClassroom);
    });

    it("should throw an error if the classroom is not found", async () => {
        getOneItem.mockResolvedValueOnce(null);

        await expect(classroom_by_code_service("CLASSB")).rejects.toEqual({
            code: 404,
            message: "Classroom not found",
        });

        expect(getOneItem).toHaveBeenCalledWith(Class, { code: "CLASSB" });
    });

    it("should throw a generic error if something goes wrong", async () => {
        const mockError = new Error("Something went wrong");
        getOneItem.mockRejectedValueOnce(mockError);

        await expect(classroom_by_code_service("CLASSC")).rejects.toEqual({
            code: 500,
            message: "Something went wrong",
        });

        expect(getOneItem).toHaveBeenCalledWith(Class, { code: "CLASSC" });
    });
});