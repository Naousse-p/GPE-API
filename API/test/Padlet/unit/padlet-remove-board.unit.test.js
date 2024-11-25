const { padlet_board_remove_service } = require("../../../src/controllers/padlet/services");
const { PadletBoard, PadletPost, PadletSection } = require("../../../src/models");
const { getItemById, deleteItem, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");

describe("padlet_board_remove_service", () => {
    const req = { userId: "valid-user-id", role: "professor" };
    const boardId = "valid-board-id";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove a board successfully when the user has permission", async () => {
        const mockBoard = {
            _id: boardId,
            class: { professor: [{ user: req.userId }] },
        };

        const mockPosts = [
            { _id: "post-1", source: "file1.pdf" },
            { _id: "post-2", source: null },
        ];

        const mockSections = [{ _id: "section-1" }];

        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoard);
        getItems.mockResolvedValueOnce(mockPosts);
        getItems.mockResolvedValueOnce(mockSections);

        fs.existsSync.mockReturnValue(true);

        const result = await padlet_board_remove_service(boardId, req);

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(getItemById).toHaveBeenCalledWith(PadletBoard, boardId, { path: "class", populate: { path: "professor" } });
        expect(deleteItem).toHaveBeenCalledWith(PadletBoard, boardId);

        expect(deleteItem).toHaveBeenCalledWith(PadletPost, "post-1");

        expect(deleteItem).toHaveBeenCalledWith(PadletSection, "section-1");

        expect(result).toEqual({ message: "Board deleted successfully" });
    });

    it("should throw a 403 error if the user does not have permission (professor role)", async () => {
        const mockBoard = {
            _id: boardId,
            class: { professor: [{ user: "another-user-id" }] },
        };

        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoard);

        await expect(padlet_board_remove_service(boardId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(getItemById).toHaveBeenCalledWith(PadletBoard, boardId, { path: "class", populate: { path: "professor" } });
        expect(deleteItem).not.toHaveBeenCalled();
    });

    it("should throw a 403 error if the user has a parent role", async () => {
        const reqParent = { userId: "parent-id", role: "parents" };

        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce({});

        await expect(padlet_board_remove_service(boardId, reqParent)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to do this",
        });

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(getItemById).toHaveBeenCalledWith(PadletBoard, boardId, { path: "class", populate: { path: "professor" } });
        expect(deleteItem).not.toHaveBeenCalled();
    });

    it("should throw a 404 error if the board is not found", async () => {
        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_board_remove_service(boardId, req)).rejects.toEqual({
            code: 404,
            message: "Board not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(getItemById).toHaveBeenCalledWith(PadletBoard, boardId, { path: "class", populate: { path: "professor" } });
        expect(deleteItem).not.toHaveBeenCalled();
    });
});