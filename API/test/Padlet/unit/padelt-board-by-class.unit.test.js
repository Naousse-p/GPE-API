const { padlet_board_by_class_service } = require("../../../src/controllers/padlet/services");
const { PadletBoard, Parent, Class } = require("../../../src/models");
const { getItems, getItemById, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItems: jest.fn(),
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("padlet_board_by_class_service", () => {
    const classId = "valid-class-id";
    const req = { userId: "valid-user-id", role: ["professor"] };

    const mockClass = {
        _id: classId,
        professor: [{ user: req.userId }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the padlet boards for the class", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        const mockBoards = [{ _id: "board1" }, { _id: "board2" }];
        getItems.mockResolvedValueOnce(mockBoards);

        const result = await padlet_board_by_class_service(classId, req);

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(result).toEqual(mockBoards);
    });

    it("should throw a 404 error if the class is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_board_by_class_service(classId, req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });
    });

    it("should return boards only visible to parents if the user is a parent", async () => {
        const parentReq = { userId: "parent-id", role: ["parents"] };
        const mockParent = { _id: "parent-id", children: [{ class: classId }] };
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getOneItem.mockResolvedValueOnce(mockParent);
        const mockBoards = [{ _id: "board1" }];
        getItems.mockResolvedValueOnce(mockBoards);

        const result = await padlet_board_by_class_service(classId, parentReq);

        expect(getItems).toHaveBeenCalledWith(PadletBoard, { $or: [{ class: classId }, { sharedWithClasses: classId }], visibleToParents: true });
        expect(result).toEqual(mockBoards);
    });
});