const { wallpost_update_comment_service } = require("../../../src/controllers/wallpost/services");
const { WallpostComment } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("wallpost_update_comment_service", () => {
    const commentId = "validCommentId";
    const newContent = "Updated comment content";
    const req = {
        userId: "validUserId",
        role: ["professor"],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the comment successfully", async () => {
        const commentMock = {
            _id: commentId,
            professor: { user: "validUserId" },
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(commentMock);
        updateItem.mockResolvedValue({ ...commentMock, content: newContent });

        const result = await wallpost_update_comment_service(commentId, newContent, req);

        expect(isIDGood).toHaveBeenCalledWith(commentId);
        expect(getItemById).toHaveBeenCalledWith(WallpostComment, commentId, "professor parent");
        expect(updateItem).toHaveBeenCalledWith(WallpostComment, commentId, { content: newContent });
        expect(result).toEqual({ ...commentMock, content: newContent });
    });

    it("should throw a 403 error if the user is not authorized to update the comment", async () => {
        const commentMock = {
            _id: commentId,
            professor: { user: "anotherUserId" },
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(commentMock);

        await expect(wallpost_update_comment_service(commentId, newContent, req)).rejects.toEqual({
            code: 403,
            message: "Vous n'avez pas la permission de modifier ce commentaire",
        });

        expect(isIDGood).toHaveBeenCalledWith(commentId);
        expect(getItemById).toHaveBeenCalledWith(WallpostComment, commentId, "professor parent");
    });

    it("should throw a 404 error if the comment is not found", async () => {
        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(null);

        await expect(wallpost_update_comment_service(commentId, newContent, req)).rejects.toEqual({
            code: 404,
            message: "Commentaire non trouvé",
        });

        expect(isIDGood).toHaveBeenCalledWith(commentId);
        expect(getItemById).toHaveBeenCalledWith(WallpostComment, commentId, "professor parent");
    });

    it("should throw a 422 error if the commentId is invalid", async () => {
        isIDGood.mockResolvedValue(false);

        await expect(wallpost_update_comment_service(commentId, newContent, req)).rejects.toEqual({
            code: 422,
            message: "L'identifiant du commentaire est invalide",
        });

        expect(isIDGood).toHaveBeenCalledWith(commentId);
    });

    it("should throw a 500 error for internal server error", async () => {
        isIDGood.mockRejectedValue(new Error("Internal Server Error"));

        await expect(wallpost_update_comment_service(commentId, newContent, req)).rejects.toEqual({
            code: 500,
            message: "Internal Server Error",
        });

        expect(isIDGood).toHaveBeenCalledWith(commentId);
    });
});