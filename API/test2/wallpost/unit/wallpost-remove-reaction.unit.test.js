const { wallpost_remove_reaction_service } = require("../../../src/controllers/wallpost/services");
const { WallpostReaction, Parent } = require("../../../src/models");
const { getItemById, deleteItem, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("wallpost_remove_reaction_service", () => {
    const reactionId = "validReactionId";
    const req = {
        userId: "validUserId",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove a reaction successfully", async () => {
        const reactionMock = {
            _id: reactionId,
            parent: "validParentId",
        };

        const parentMock = {
            _id: "validParentId",
            user: req.userId,
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(reactionMock);
        getOneItem.mockResolvedValue(parentMock);

        const result = await wallpost_remove_reaction_service(reactionId, req);

        expect(isIDGood).toHaveBeenCalledWith(reactionId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: req.userId });
        expect(result).toEqual({ message: "Réaction supprimée avec succès" });
    });

    it("should throw a 404 error if the reaction is not found", async () => {
        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(null);

        await expect(wallpost_remove_reaction_service(reactionId, req)).rejects.toEqual({
            code: 404,
            message: "Réaction non trouvée",
        });

        expect(isIDGood).toHaveBeenCalledWith(reactionId);
    });

    it("should throw a 403 error if the parent does not own the reaction", async () => {
        const reactionMock = {
            _id: reactionId,
            parent: "anotherParentId",
        };

        const parentMock = {
            _id: "validParentId",
            user: req.userId,
        };

        isIDGood.mockResolvedValue(true);
        getItemById.mockResolvedValue(reactionMock);
        getOneItem.mockResolvedValue(parentMock);

        await expect(wallpost_remove_reaction_service(reactionId, req)).rejects.toEqual({
            code: 403,
            message: "Vous n'avez pas la permission de supprimer cette réaction",
        });

        expect(isIDGood).toHaveBeenCalledWith(reactionId);
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: req.userId });
    });

    it("should throw a 500 error for internal server error", async () => {
        isIDGood.mockRejectedValue(new Error("Internal Server Error"));

        await expect(wallpost_remove_reaction_service(reactionId, req)).rejects.toEqual({
            code: 500,
            message: "Internal Server Error",
        });

        expect(isIDGood).toHaveBeenCalledWith(reactionId);
    });
});