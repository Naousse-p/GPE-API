const { padlet_post_remove_service } = require("../../../src/controllers/padlet/services");
const { PadletPost } = require("../../../src/models");
const { getItemById, deleteItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");

describe("padlet_post_remove_service", () => {
    const postId = "valid-post-id";
    const req = { userId: "valid-user-id", role: "professor" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove a post successfully when the user has permission", async () => {
        const mockPost = {
            _id: postId,
            source: "file.pdf",
            board: {
                class: { professor: [{ user: req.userId }] },
            },
        };

        isIDGood.mockResolvedValueOnce(postId);
        getItemById.mockResolvedValueOnce(mockPost);
        fs.existsSync.mockReturnValue(true);

        const result = await padlet_post_remove_service(postId, req);

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(deleteItem).toHaveBeenCalledWith(PadletPost, postId);
        expect(result).toEqual({ message: "Post deleted successfully" });
    });

    it("should throw a 403 error if the user has a parent role", async () => {
        const reqParent = { userId: "parent-id", role: "parents" };

        isIDGood.mockResolvedValueOnce(postId);
        getItemById.mockResolvedValueOnce({});

        await expect(padlet_post_remove_service(postId, reqParent)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to do this",
        });

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(deleteItem).not.toHaveBeenCalled();
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        const mockPost = {
            _id: postId,
            board: { class: { professor: [{ user: "another-user-id" }] } },
        };

        isIDGood.mockResolvedValueOnce(postId);
        getItemById.mockResolvedValueOnce(mockPost);

        await expect(padlet_post_remove_service(postId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(deleteItem).not.toHaveBeenCalled();
    });

    it("should throw a 404 error if the post is not found", async () => {
        isIDGood.mockResolvedValueOnce(postId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_post_remove_service(postId, req)).rejects.toEqual({
            code: 404,
            message: "Post not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(deleteItem).not.toHaveBeenCalled();
    });
});