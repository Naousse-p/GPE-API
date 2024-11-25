const { padlet_update_post_service } = require("../../../src/controllers/padlet/services");
const { PadletPost, PadletSection } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../src/utils/multer");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/models", () => ({
    PadletPost: jest.fn(),
    PadletSection: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/multer", () => ({
    saveSourceFile: jest.fn(),
}));

jest.mock("fs");

describe("padlet_update_post_service", () => {
    const postId = "valid-post-id";
    const req = { userId: "valid-user-id", file: { buffer: Buffer.from("test"), originalname: "file.png" } };
    const mockPost = {
        _id: postId,
        board: { class: { professor: [{ user: req.userId }] } },
        title: "Original Title",
        content: "Original content",
        save: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the Padlet post successfully", async () => {
        const datas = { title: "Updated Title", content: "Updated content" };

        isIDGood.mockResolvedValueOnce(postId);
        getItemById.mockResolvedValueOnce(mockPost);
        updateItem.mockResolvedValueOnce({ ...mockPost, title: datas.title, content: datas.content });

        const result = await padlet_update_post_service(datas, postId, req);

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).toHaveBeenCalledWith(PadletPost, postId, { title: "Updated Title", content: "Updated content" });
        expect(result).toEqual({ ...mockPost, title: "Updated Title", content: "Updated content" });
    });

    it("should throw a 403 error if the user does not have permission to update the post", async () => {
        const reqWithoutPermission = { userId: "invalid-user-id" };
        const mockPostWithoutPermission = {
            _id: postId,
            board: { class: { professor: [{ user: "another-user-id" }] } },
        };

        isIDGood.mockResolvedValueOnce(postId);
        getItemById.mockResolvedValueOnce(mockPostWithoutPermission);

        await expect(padlet_update_post_service({}, postId, reqWithoutPermission)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).not.toHaveBeenCalled();
    });

    it("should throw a 404 error if the post is not found", async () => {
        isIDGood.mockResolvedValueOnce(postId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_update_post_service({}, postId, req)).rejects.toEqual({
            code: 404,
            message: "Post not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).not.toHaveBeenCalled();
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const datas = { title: "New Title" };
        const unexpectedError = new Error("Unexpected error");

        isIDGood.mockResolvedValueOnce(postId);
        getItemById.mockResolvedValueOnce(mockPost);
        updateItem.mockRejectedValueOnce(unexpectedError);

        await expect(padlet_update_post_service(datas, postId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).toHaveBeenCalledWith(PadletPost, postId, { title: "New Title" });
    });
});
