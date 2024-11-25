const { padlet_create_section_service } = require("../../../src/controllers/padlet/services");
const { PadletBoard, PadletSection } = require("../../../src/models");
const { createItem, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    createItem: jest.fn(),
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("padlet_create_section_service", () => {
    const req = { userId: "valid-user-id" };
    const boardId = "valid-board-id";
    const datas = { title: "Section Title" };

    const mockBoard = {
        _id: boardId,
        class: {
            professor: [{ user: "valid-user-id" }],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new section successfully", async () => {
        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoard);

        const createdSection = { _id: "new-section-id", ...datas, board: boardId };
        createItem.mockResolvedValueOnce(createdSection);

        const result = await padlet_create_section_service(datas, boardId, req);

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(getItemById).toHaveBeenCalledWith(PadletBoard, boardId, {
            path: "class",
            populate: { path: "professor" },
        });
        expect(createItem).toHaveBeenCalledWith(PadletSection, {
            title: datas.title,
            board: boardId,
        });
        expect(result).toEqual(createdSection);
    });

    it("should throw a 403 error if the user doesn't have permission for the board", async () => {
        const mockBoardWithoutPermission = {
            ...mockBoard,
            class: {
                professor: [{ user: "another-user-id" }],
            },
        };

        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoardWithoutPermission);

        await expect(padlet_create_section_service(datas, boardId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 404 error if the board is not found", async () => {
        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_create_section_service(datas, boardId, req)).rejects.toEqual({
            code: 404,
            message: "Board not found",
        });
    });
});