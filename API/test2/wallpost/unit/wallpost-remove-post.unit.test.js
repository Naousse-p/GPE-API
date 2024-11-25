const { wallpost_remove_post_service } = require("../../../src/controllers/wallpost/services");
const { WallpostPost, WallpostReaction, WallpostComment } = require("../../../src/models");
const { getItemById, deleteItem, deleteItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
    deleteItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");
jest.mock("path", () => ({
    join: jest.fn().mockReturnValue("/fake/path/to/file"),
}));

describe("wallpost_remove_post_service", () => {
    const postId = "validPostId";
    const req = {
        userId: "validUserId",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove the post, associated files, comments, and reactions successfully", async () => {
        const postMock = {
            _id: postId,
            class: { professor: [{ user: req.userId }] },
            source: ["file1.jpg", "file2.jpg"],
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(postMock);
        fs.existsSync.mockReturnValue(true);

        const result = await wallpost_remove_post_service(postId, req);

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(fs.unlinkSync).toHaveBeenCalledWith("/fake/path/to/file");
        expect(result).toEqual({ message: "Post supprimé avec succès" });
    });

    it("should throw a 404 error if the post is not found", async () => {
        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(null);

        await expect(wallpost_remove_post_service(postId, req)).rejects.toEqual({
            code: 404,
            message: "Post non trouvé",
        });

        expect(isIDGood).toHaveBeenCalledWith(postId);
    });

    it("should throw a 403 error if the user does not have permission to delete the post", async () => {
        const postMock = {
            _id: postId,
            class: { professor: [{ user: "anotherUserId" }] },
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(postMock);

        await expect(wallpost_remove_post_service(postId, req)).rejects.toEqual({
            code: 403,
            message: "Vous n'avez pas la permission d'accéder à cette ressource",
        });

        expect(isIDGood).toHaveBeenCalledWith(postId);
    });

    it("should not try to delete files if the post has no source", async () => {
        const postMock = {
            _id: postId,
            class: { professor: [{ user: req.userId }] },
            source: null,
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(postMock);

        const result = await wallpost_remove_post_service(postId, req);

        expect(fs.unlinkSync).not.toHaveBeenCalled();
        expect(result).toEqual({ message: "Post supprimé avec succès" });
    });
});