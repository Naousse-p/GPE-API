const { wallpost_mark_as_read_post_service } = require("../../../src/controllers/wallpost/services");
const { WallpostPost, Parent } = require("../../../src/models");
const { getItemById, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("wallpost_mark_as_read_post_service", () => {
    const postId = "validPostId";
    const req = {
        userId: "validUserId",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should mark a post as read successfully", async () => {
        const postMock = {
            _id: postId,
            class: "classId",
            views: [],
            save: jest.fn(),
        };
        const parentMock = {
            _id: "validParentId",
            children: [{ class: "classId" }],
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(postMock);
        getOneItem.mockResolvedValue(parentMock);

        const result = await wallpost_mark_as_read_post_service(postId, req);

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(WallpostPost, postId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: req.userId });
        expect(postMock.views).toContain(parentMock._id);
        expect(postMock.save).toHaveBeenCalled();
        expect(result).toEqual(postMock);
    });

    it("should throw a 422 error if the post ID is invalid", async () => {
        isIDGood.mockResolvedValue(false);

        await expect(wallpost_mark_as_read_post_service(postId, req)).rejects.toEqual({
            code: 422,
            message: "L'identifiant du post est invalide",
        });
    });

    it("should throw a 404 error if the post is not found", async () => {
        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(null);

        await expect(wallpost_mark_as_read_post_service(postId, req)).rejects.toEqual({
            code: 404,
            message: "Post non trouvé",
        });
    });

    it("should throw a 404 error if the parent is not found", async () => {
        const postMock = {
            _id: postId,
            class: "classId",
            views: [],
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(postMock);
        getOneItem.mockResolvedValue(null);

        await expect(wallpost_mark_as_read_post_service(postId, req)).rejects.toEqual({
            code: 404,
            message: "Parent non trouvé",
        });
    });

    it("should throw a 403 error if the parent does not have access to the post", async () => {
        const postMock = {
            _id: postId,
            class: "classId",
            views: [],
        };
        const parentMock = {
            _id: "validParentId",
            children: [{ class: "anotherClassId" }],
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(postMock);
        getOneItem.mockResolvedValue(parentMock);

        await expect(wallpost_mark_as_read_post_service(postId, req)).rejects.toEqual({
            code: 403,
            message: "Vous n'avez pas la permission d'accéder à cette ressource",
        });
    });

    it("should not add the parent ID to views if already marked as read", async () => {
        const postMock = {
            _id: postId,
            class: "classId",
            views: ["validParentId"],
            save: jest.fn(),
        };
        const parentMock = {
            _id: "validParentId",
            children: [{ class: "classId" }],
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(postMock);
        getOneItem.mockResolvedValue(parentMock);

        await wallpost_mark_as_read_post_service(postId, req);

        expect(postMock.views).toContain("validParentId");
        expect(postMock.save).not.toHaveBeenCalled();
    });
});