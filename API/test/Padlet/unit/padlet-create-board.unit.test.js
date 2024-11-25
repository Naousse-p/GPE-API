const { padlet_create_board_service } = require("../../../src/controllers/padlet/services");
const { Class, PadletBoard } = require("../../../src/models");
const { createItem, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const generateRandomPastelColor = require("../../../src/controllers/padlet/helpers/generate-random-color");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    createItem: jest.fn(),
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/controllers/padlet/helpers/generate-random-color", () => jest.fn());

describe("padlet_create_board_service", () => {
    const req = { userId: "valid-user-id" };
    const classId = "valid-class-id";
    const datas = { name: "Board Name", visibleToParents: true };

    const mockClass = {
        _id: classId,
        professor: [{ user: "valid-user-id" }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new Padlet board successfully", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        generateRandomPastelColor.mockReturnValue("#aabbcc");
        createItem.mockResolvedValueOnce({ _id: "new-board-id", ...datas, class: classId, color: "#aabbcc" });

        const result = await padlet_create_board_service(datas, classId, req);

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor");
        expect(createItem).toHaveBeenCalledWith(PadletBoard, {
            name: datas.name,
            color: "#aabbcc",
            class: classId,
            visibleToParents: datas.visibleToParents,
        });
        expect(result).toEqual({ _id: "new-board-id", ...datas, class: classId, color: "#aabbcc" });
    });

    it("should throw a 404 error if class is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_create_board_service(datas, classId, req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });
    });

    it("should throw a 403 error if the user doesn't have permission for the class", async () => {
        const mockClassWithoutPermission = {
            _id: classId,
            professor: [{ user: "another-user-id" }],
        };

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClassWithoutPermission);

        await expect(padlet_create_board_service(datas, classId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should use a random pastel color if no color is provided", async () => {
        const datasWithoutColor = { name: "Board Name", visibleToParents: true };
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        generateRandomPastelColor.mockReturnValue("#aabbcc");
        createItem.mockResolvedValueOnce({ _id: "new-board-id", ...datasWithoutColor, class: classId, color: "#aabbcc" });

        const result = await padlet_create_board_service(datasWithoutColor, classId, req);

        expect(generateRandomPastelColor).toHaveBeenCalled();
        expect(result.color).toBe("#aabbcc");
    });
});