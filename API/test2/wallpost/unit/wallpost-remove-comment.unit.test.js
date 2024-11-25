const { wallpost_remove_comment_service } = require("../../../src/controllers/wallpost/services");
const { WallpostComment, Class, School } = require("../../../src/models");
const { getItemById, deleteItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/models", () => ({
    School: {
        findById: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
    }
}));

describe("wallpost_remove_comment_service", () => {
    const commentId = "validCommentId";
    const req = {
        userId: "validUserId",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove the comment successfully if the user is the parent who posted the comment", async () => {
        const commentMock = {
            _id: commentId,
            parent: { user: req.userId },
            post: "postId",
        };
        const classMock = {
            _id: "classId",
            school: "schoolId",
            professor: [],
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValueOnce(commentMock).mockResolvedValueOnce(classMock);

        const result = await wallpost_remove_comment_service(commentId, req);

        expect(isIDGood).toHaveBeenCalledWith(commentId);
        expect(getItemById).toHaveBeenCalledWith(WallpostComment, commentId, "post parent professor");
        expect(deleteItem).toHaveBeenCalledWith(WallpostComment, commentId);
        expect(result).toEqual({ message: "Commentaire supprimé avec succès" });
    });

    it("should remove the comment successfully if the user is a professor of the class", async () => {
        const commentMock = {
            _id: commentId,
            parent: null,
            post: "postId",
        };
        const classMock = {
            _id: "classId",
            school: "schoolId",
            professor: [{ user: req.userId }],
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValueOnce(commentMock).mockResolvedValueOnce(classMock);

        const result = await wallpost_remove_comment_service(commentId, req);

        expect(isIDGood).toHaveBeenCalledWith(commentId);
        expect(getItemById).toHaveBeenCalledWith(WallpostComment, commentId, "post parent professor");
        expect(deleteItem).toHaveBeenCalledWith(WallpostComment, commentId);
        expect(result).toEqual({ message: "Commentaire supprimé avec succès" });
    });

    it("should throw a 404 error if the comment does not exist", async () => {
        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(null);

        await expect(wallpost_remove_comment_service(commentId, req)).rejects.toEqual({
            code: 404,
            message: "Commentaire non trouvé",
        });
    });

    it("should throw a 422 error if the comment ID is invalid", async () => {
        isIDGood.mockResolvedValue(false);

        await expect(wallpost_remove_comment_service(commentId, req)).rejects.toEqual({
            code: 422,
            message: "L'identifiant du commentaire est invalide",
        });
    });
});