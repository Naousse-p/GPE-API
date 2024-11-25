const { wallpost_get_posts_service } = require("../../../src/controllers/wallpost/services");
const { WallpostPost, WallpostComment, WallpostReaction, Class, Parent } = require("../../../src/models");
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

describe("wallpost_get_posts_service", () => {
    const classId = "validClassId";
    const req = {
        userId: "validUserId",
        role: ["professor"],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return posts with comments and reactions successfully", async () => {
        const classMock = { _id: classId, professor: [{ user: "validUserId" }] };
        const postsMock = [
            {
                _id: "post1",
                class: classId,
                views: [],
                toObject: jest.fn().mockReturnValue({ _id: "post1" }),
            },
        ];
        const commentsMock = [
            {
                post: "post1",
                professor: { firstname: "Prof", lastname: "One" },
                toObject: jest.fn().mockReturnValue({ post: "post1" }),
            },
        ];
        const reactionsMock = [
            {
                post: "post1",
                emoji: "👍",
                parent: { firstname: "Parent", lastname: "One", user: "validParentId" },
                toObject: jest.fn().mockReturnValue({ post: "post1", emoji: "👍" }),
            },
        ];
        const parentsMock = [
            {
                _id: "validParentId",
                firstname: "Parent",
                lastname: "One",
                children: [{ class: classId }],
            },
        ];

        const parentMock = {
            _id: "validParentId",
            firstname: "Parent",
            lastname: "One",
            children: [{ class: classId }],
        };

        isIDGood.mockResolvedValue(classId);
        getItemById
            .mockResolvedValueOnce(classMock)
        getItems
            .mockResolvedValueOnce(postsMock) 
            .mockResolvedValueOnce(parentsMock)
            .mockResolvedValueOnce(commentsMock) 
            .mockResolvedValueOnce(reactionsMock) 

        const result = await wallpost_get_posts_service(classId, req);

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(result).toEqual([
            {
                _id: "post1",
                comments: [{ post: "post1", name: "Prof One", mine: false }],
                reactions: [{ emoji: "👍", count: 1, parents: [ "Parent One", ], mine: false, _id: undefined }],
                parentsNotViewed: [ 'Parent One' ],
            },
        ]);
    });

    it("should throw 404 if the class is not found", async () => {
        isIDGood.mockResolvedValue(classId);
        getItemById.mockResolvedValue(undefined);

        await expect(wallpost_get_posts_service(classId, req)).rejects.toEqual({
            code: 404,
            message: "Classe non trouvée",
        });
    });
});