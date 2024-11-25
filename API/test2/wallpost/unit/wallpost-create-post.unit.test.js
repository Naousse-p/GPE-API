const { wallpost_create_post_service } = require("../../../src/controllers/wallpost/services");
const { WallpostPost, School, Class } = require("../../../src/models");
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

describe("wallpost_create_post_service", () => {
    const classId = "validClassId";
    const req = {
        userId: "validUserId",
        files: [],
    };
    const datas = {
        title: "Post title",
        text: "Post content",
        tags: ["tag1", "tag2"],
        type: "announcement",
        dateTimePublish: new Date(),
        allowComments: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a post successfully", async () => {
        const classItemMock = {
            _id: classId,
            professor: [{ user: "validUserId" }],
            school: "validSchoolId",
        };

        const createdPostMock = {
            _id: "validPostId",
            save: jest.fn(),
        };

        const schoolMock = {
            _id: "validSchoolId",
            professor: [{ user: "validUserId" }],
            populate: jest.fn().mockResolvedValue(this),
        };

        isIDGood.mockResolvedValue(classId);
        getItemById.mockResolvedValueOnce(classItemMock);
        createItem.mockResolvedValue(createdPostMock);
        School.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(schoolMock),
        });

        const result = await wallpost_create_post_service(datas, classId, req);

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, { path: "professor" });
        expect(createItem).toHaveBeenCalledWith(WallpostPost, expect.any(Object));
        expect(createdPostMock.save).toHaveBeenCalled();
        expect(result).toEqual(createdPostMock);
    });

    it("should throw a 404 error if the class is not found", async () => {
        isIDGood.mockResolvedValue(classId);
        getItemById.mockResolvedValue(null);

        await expect(wallpost_create_post_service(datas, classId, req)).rejects.toEqual({
            code: 404,
            message: "Classe non trouvée",
        });
    });

    it("should handle file uploads and save file paths", async () => {
        const classItemMock = {
            _id: classId,
            professor: [{ user: "validUserId" }],
            school: "validSchoolId",
        };

        const createdPostMock = {
            _id: "validPostId",
            save: jest.fn(),
        };

        req.files = [{ buffer: Buffer.from("file1"), originalname: "file1.jpg" }];

        isIDGood.mockResolvedValue(classId);
        getItemById.mockResolvedValue(classItemMock);
        createItem.mockResolvedValue(createdPostMock);
        saveSourceFile.mockResolvedValue("path/to/file1.jpg");

        const result = await wallpost_create_post_service(datas, classId, req);

        expect(saveSourceFile).toHaveBeenCalledWith(expect.any(Buffer), "validPostId_0", "wallpost-posts", "jpg", true);
        expect(createdPostMock.source).toEqual(["path/to/file1.jpg"]);
        expect(createdPostMock.save).toHaveBeenCalled();
        expect(result).toEqual(createdPostMock);
    });
});