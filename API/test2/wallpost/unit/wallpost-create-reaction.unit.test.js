const { wallpost_create_reaction_service } = require("../../../src/controllers/wallpost/services");
const { WallpostPost, WallpostReaction, Parent, Class } = require("../../../src/models");
const { createItem, getItemById, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    createItem: jest.fn(),
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("wallpost_create_reaction_service", () => {
    const postId = "validPostId";
    const emoji = "👍";
    const req = {
        userId: "validUserId",
        role: ["parents"],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a reaction successfully", async () => {
        const postItemMock = {
            _id: postId,
            class: "validClassId",
            dateTimePublish: new Date(Date.now() - 1000), // Already published
        };
        const classItemMock = {
            _id: "validClassId",
            professor: [{ user: "validUserId" }],
        };
        const parentMock = {
            _id: "validParentId",
            children: [{ class: "validClassId" }],
        };
        const createdReactionMock = {
            _id: "validReactionId",
            save: jest.fn(),
        };

        isIDGood.mockResolvedValue(postId);
        getItemById.mockResolvedValueOnce(postItemMock);
        getItemById.mockResolvedValueOnce(classItemMock); 
        getOneItem.mockResolvedValue(parentMock); 
        createItem.mockResolvedValue(createdReactionMock);

        const result = await wallpost_create_reaction_service(postId, emoji, req);

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(WallpostPost, postId);
        expect(getItemById).toHaveBeenCalledWith(Class, "validClassId", "professor");
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: "validUserId" });
        expect(createItem).toHaveBeenCalledWith(WallpostReaction, expect.any(Object));
        expect(result).toEqual(createdReactionMock);
    });

    it("should throw a 404 error if the post is not found", async () => {
        isIDGood.mockResolvedValue(postId);
        getItemById.mockResolvedValue(null); 

        await expect(wallpost_create_reaction_service(postId, emoji, req)).rejects.toEqual({
            code: 404,
            message: "Post non trouvé",
        });
    });

    it("should throw a 403 error if the user is not a parent", async () => {
        const postItemMock = {
            _id: postId,
            class: "validClassId",
            dateTimePublish: new Date(Date.now() - 1000),
        };

        isIDGood.mockResolvedValue(postId);
        getItemById.mockResolvedValue(postItemMock);

        req.role = ["professor"];

        await expect(wallpost_create_reaction_service(postId, emoji, req)).rejects.toEqual({
            code: 403,
            message: "Seuls les parents peuvent ajouter des réactions",
        });
    });
});