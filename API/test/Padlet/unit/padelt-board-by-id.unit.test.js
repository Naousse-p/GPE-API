const { padlet_board_by_id_service } = require("../../../src/controllers/padlet/services");
const { PadletBoard, PadletPost, PadletSection, Parent, Class } = require("../../../src/models");
const { getItemById, getOneItem, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("padlet_board_by_id_service", () => {
    const boardId = "valid-board-id";
    const req = { userId: "valid-user-id", role: ["professor"] };

    const mockBoard = {
        _id: boardId,
        class: { _id: "class-id", professor: [{ user: "valid-user-id" }] },
        visibleToParents: true,
        sharedWithClasses: [],
    };

    const mockBoardVisibleByParentFalse = {
        _id: boardId,
        class: { _id: "class-id", professor: [{ user: "valid-user-id" }] },
        visibleToParents: false,
        sharedWithClasses: [],
    };

    const mockSections = [
        { _id: "section1", toObject: jest.fn().mockReturnValue({ _id: "section1", posts: [] }) },
        { _id: "section2", toObject: jest.fn().mockReturnValue({ _id: "section2", posts: [] }) },
    ];

    const mockPosts = [{ _id: "post1" }, { _id: "post2" }];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the board with sections and posts", async () => {
        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoard);
        getItems.mockResolvedValueOnce(mockSections); 
        getItems.mockResolvedValueOnce(mockPosts);

        const result = await padlet_board_by_id_service(boardId, req);

        expect(isIDGood).toHaveBeenCalledWith(boardId);
        expect(result.sections.length).toBe(2);
        expect(result.sections[0].posts).toEqual(mockPosts);
    });

    it("should throw a 404 error if the board is not found", async () => {
        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_board_by_id_service(boardId, req)).rejects.toEqual({
            code: 404,
            message: "Board not found",
        });
    });

    it("should throw a 403 error if the user does not have permission as a parent", async () => {
        const parentReq = { userId: "parent-id", role: ["parents"] };
        const mockParent = { _id: "parent-id", children: [{ class: "class-id" }] };

        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoardVisibleByParentFalse);
        getOneItem.mockResolvedValueOnce(mockParent);

        await expect(padlet_board_by_id_service(boardId, parentReq)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should return 403 if the board is not visible to parents", async () => {
        const parentReq = { userId: "parent-id", role: ["parents"] };
        const mockBoardNotVisible = { ...mockBoardVisibleByParentFalse, visibleToParents: false };

        isIDGood.mockResolvedValueOnce(boardId);
        getItemById.mockResolvedValueOnce(mockBoardNotVisible);

        await expect(padlet_board_by_id_service(boardId, parentReq)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });
});