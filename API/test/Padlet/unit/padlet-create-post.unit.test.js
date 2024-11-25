const { padlet_create_post_service } = require("../../../src/controllers/padlet/services");
const { PadletPost, PadletSection } = require("../../../src/models");
const { createItem, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../src/utils/multer");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    createItem: jest.fn(),
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/multer", () => ({
    saveSourceFile: jest.fn(),
}));

describe("padlet_create_post_service", () => {
    const req = { userId: "valid-user-id", file: { buffer: Buffer.from("test"), originalname: "testfile.png" } };
    const sectionId = "valid-section-id";
    const datas = { title: "Post Title", content: "Post Content", type: "text" };

    const mockSection = {
        _id: sectionId,
        board: {
            class: { professor: [{ user: "valid-user-id" }] },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new Padlet post successfully", async () => {
        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(mockSection);

        const createdPost = {
            _id: "new-post-id",
            ...datas,
            sectionId,
            save: jest.fn(),
        };

        createItem.mockResolvedValueOnce(createdPost);

        const result = await padlet_create_post_service(datas, sectionId, req);

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, {
            path: "board",
            populate: { path: "class", populate: { path: "professor" } },
        });
        expect(createItem).toHaveBeenCalledWith(PadletPost, {
            title: datas.title,
            content: datas.content,
            type: datas.type,
            sectionId,
            creator: req.userId,
            board: mockSection.board,
            url: null,
        });
        expect(createdPost.save).toHaveBeenCalled();
        expect(result).toEqual(createdPost);
    });

    it("should save a file if attached to the post", async () => {
        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(mockSection);

        const createdPost = {
            _id: "new-post-id",
            ...datas,
            sectionId,
            save: jest.fn(),
        };

        createItem.mockResolvedValueOnce(createdPost);
        saveSourceFile.mockResolvedValueOnce("path/to/file.png");

        const result = await padlet_create_post_service(datas, sectionId, req);

        expect(saveSourceFile).toHaveBeenCalledWith(req.file.buffer, "new-post-id", "padlet-posts", "png", false);
        expect(result.source).toBe("path/to/file.png");
        expect(createdPost.save).toHaveBeenCalled();
    });

    it("should throw a 403 error if the user doesn't have permission for the section", async () => {
        const mockSectionWithoutPermission = {
            ...mockSection,
            board: {
                class: { professor: [{ user: "another-user-id" }] },
            },
        };

        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(mockSectionWithoutPermission);

        await expect(padlet_create_post_service(datas, sectionId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 404 error if the section is not found", async () => {
        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_create_post_service(datas, sectionId, req)).rejects.toEqual({
            code: 404,
            message: "Section not found",
        });
    });
});