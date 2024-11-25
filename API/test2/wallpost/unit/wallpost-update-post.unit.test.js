const { wallpost_update_post_service } = require("../../../src/controllers/wallpost/services");
const { WallpostPost } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../src/utils/multer");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/multer", () => ({
    saveSourceFile: jest.fn(),
}));

jest.mock("fs");

describe("wallpost_update_post_service", () => {
    let req, datas, postItemMock;

    beforeEach(() => {
        req = {
            userId: "validUserId",
            files: [],
        };

        datas = {
            title: "Updated Title",
            text: "Updated Text",
            tags: ["tag1", "tag2"],
            allowComments: true,
            dateTimePublish: new Date(),
            filesToRemove: JSON.stringify(["file1.jpg"]),
        };

        postItemMock = {
            _id: "validPostId",
            title: "Original Title",
            text: "Original Text",
            tags: [],
            source: ["file1.jpg", "file2.jpg"],
            allowComments: false,
            dateTimePublish: new Date(),
            class: { professor: [{ user: "validUserId" }] },
            save: jest.fn(),
        };

        jest.clearAllMocks();
    });

    it("should update the post successfully", async () => {
        isIDGood.mockResolvedValue("validPostId");
        getItemById.mockResolvedValue(postItemMock);
        fs.existsSync.mockReturnValue(true);

        const result = await wallpost_update_post_service("validPostId", datas, req);

        expect(isIDGood).toHaveBeenCalledWith("validPostId");
        expect(getItemById).toHaveBeenCalledWith(WallpostPost, "validPostId", { path: "class", populate: { path: "professor" } });

        expect(postItemMock.title).toBe(datas.title);
        expect(postItemMock.text).toBe(datas.text);
        expect(postItemMock.allowComments).toBe(datas.allowComments);
        expect(postItemMock.dateTimePublish).toEqual(datas.dateTimePublish);
        expect(postItemMock.tags).toEqual(datas.tags);
        expect(postItemMock.source).not.toContain("file1.jpg");
        expect(postItemMock.save).toHaveBeenCalled();
        expect(result).toEqual(postItemMock);
    });

    it("should throw a 404 error if the post is not found", async () => {
        isIDGood.mockResolvedValue("validPostId");
        getItemById.mockResolvedValue(null);

        await expect(wallpost_update_post_service("validPostId", datas, req)).rejects.toEqual({
            code: 404,
            message: "Post not found",
        });
    });

    it("should throw a 403 error if the user does not have permission to update the post", async () => {
        postItemMock.class.professor = [{ user: "anotherUserId" }];
        isIDGood.mockResolvedValue("validPostId");
        getItemById.mockResolvedValue(postItemMock);

        await expect(wallpost_update_post_service("validPostId", datas, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should add new files and update source", async () => {
        req.files = [{ buffer: Buffer.from("file3"), originalname: "file3.jpg" }];
        isIDGood.mockResolvedValue("validPostId");
        getItemById.mockResolvedValue(postItemMock);
        saveSourceFile.mockResolvedValue("path/to/file3.jpg");

        const result = await wallpost_update_post_service("validPostId", datas, req);

        expect(saveSourceFile).toHaveBeenCalledWith(Buffer.from("file3"), "validPostId_0", "wallpost-posts", "jpg", true);
        expect(postItemMock.source).toContain("path/to/file3.jpg");
        expect(postItemMock.save).toHaveBeenCalled();
        expect(result).toEqual(postItemMock);
    });

    it("should not remove files if filesToRemove is empty", async () => {
        datas.filesToRemove = "[]";
        isIDGood.mockResolvedValue("validPostId");
        getItemById.mockResolvedValue(postItemMock);

        await wallpost_update_post_service("validPostId", datas, req);

        expect(fs.unlinkSync).not.toHaveBeenCalled();
        expect(postItemMock.save).toHaveBeenCalled();
    });
});