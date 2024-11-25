const { padlet_update_board_service } = require("../../../src/controllers/padlet/services");
const { PadletBoard } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/models", () => ({
    PadletBoard: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("padlet_update_board_service", () => {
    const boardId = "valid-board-id";
    const req = { userId: "valid-user-id" };
    const mockBoard = {
        _id: boardId,
        class: { professor: [{ user: req.userId }] },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully update the Padlet board", async () => {
        const datas = {
            name: "Updated Board Name",
            color: "#FF5733",
            visibleToParents: true,
            sharedWithClasses: ["class-id-1", "class-id-2"],
        };

        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoard);
        isIDGood.mockResolvedValueOnce("class-id-1");
        isIDGood.mockResolvedValueOnce("class-id-2");
        updateItem.mockResolvedValueOnce({ ...mockBoard, ...datas });

        const result = await padlet_update_board_service(datas, boardId, req);

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(getItemById).toHaveBeenCalledWith(PadletBoard, boardId, { path: "class", populate: { path: "professor" } });
        expect(isIDGood).toHaveBeenCalledWith("class-id-1");
        expect(isIDGood).toHaveBeenCalledWith("class-id-2");
        expect(updateItem).toHaveBeenCalledWith(PadletBoard, boardId, {
            name: "Updated Board Name",
            color: "#FF5733",
            visibleToParents: true,
            sharedWithClasses: ["class-id-1", "class-id-2"],
        });
        expect(result).toEqual({ ...mockBoard, ...datas });
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        const reqWithoutPermission = { userId: "invalid-user-id" };
        const mockBoardWithoutPermission = {
            _id: boardId,
            class: { professor: [{ user: "another-user-id" }] },
        };

        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoardWithoutPermission);

        await expect(padlet_update_board_service({}, boardId, reqWithoutPermission)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(getItemById).toHaveBeenCalledWith(PadletBoard, boardId, { path: "class", populate: { path: "professor" } });
        expect(updateItem).not.toHaveBeenCalled();
    });

    it("should throw a 404 error if the board is not found", async () => {
        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_update_board_service({}, boardId, req)).rejects.toEqual({
            code: 404,
            message: "Board not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(getItemById).toHaveBeenCalledWith(PadletBoard, boardId, { path: "class", populate: { path: "professor" } });
        expect(updateItem).not.toHaveBeenCalled();
    });
});