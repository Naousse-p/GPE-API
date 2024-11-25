const { Class } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { classroom_by_id_service } = require("../../../src/controllers/classroom/services");

jest.mock("../../../src/models", () => ({
    Class: {}
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("classroom_by_id_service", () => {
    const req = { userId: "professor1" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the classroom when the user has access", async () => {
        const mockClassroom = {
            _id: "class1",
            name: "Class A",
            professor: [{ user: "professor1" }]
        };

        // Simuler la validation de l'ID
        isIDGood.mockReturnValue(true);

        // Simuler la récupération de la classe
        getItemById.mockResolvedValueOnce(mockClassroom);

        const result = await classroom_by_id_service("class1", req);

        // Vérifications
        expect(isIDGood).toHaveBeenCalledWith("class1");
        expect(getItemById).toHaveBeenCalledWith(Class, "class1", "professor");
        expect(result).toEqual(mockClassroom);
    });

    it("should throw an error if the classroom is not found", async () => {
        // Simuler la validation de l'ID
        isIDGood.mockReturnValue(true);

        // Simuler l'absence de classe
        getItemById.mockResolvedValueOnce(null);

        await expect(classroom_by_id_service("class1", req)).rejects.toEqual({
            code: 404,
            message: "Classroom not found",
        });

        expect(getItemById).toHaveBeenCalledWith(Class, "class1", "professor");
    });

    it("should throw an error if the user does not have access to the classroom", async () => {
        const mockClassroom = {
            _id: "class1",
            name: "Class A",
            professor: [{ user: "professor2" }] // L'utilisateur n'a pas accès à cette classe
        };

        // Simuler la validation de l'ID
        isIDGood.mockReturnValue(true);

        // Simuler la récupération de la classe
        getItemById.mockResolvedValueOnce(mockClassroom);

        await expect(classroom_by_id_service("class1", req)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this classroom",
        });

        expect(getItemById).toHaveBeenCalledWith(Class, "class1", "professor");
    });

    it("should throw an error if the ID is invalid", async () => {
        // Simuler un mauvais ID
        isIDGood.mockImplementation(() => {
            throw { code: 400, message: "Invalid ID format" };
        });

        await expect(classroom_by_id_service("invalid-id", req)).rejects.toEqual({
            code: 400,
            message: "Invalid ID format",
        });

        expect(isIDGood).toHaveBeenCalledWith("invalid-id");
        expect(getItemById).not.toHaveBeenCalled();
    });
});