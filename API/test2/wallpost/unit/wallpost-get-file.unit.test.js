const { wallpost_get_file_service } = require("../../../src/controllers/wallpost/services");
const { WallpostPost, Class, Parent } = require("../../../src/models");
const { getItemById, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");
jest.mock("path");

describe("wallpost_get_file_service", () => {
    const postId = "validPostId";
    const filename = "validFile.jpg";
    const req = {
        userId: "validUserId",
        role: ["professor"],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return file buffer and extension successfully for a professor", async () => {
        const postMock = {
            _id: postId,
            class: "validClassId",
            source: [filename],
        };
        const classMock = {
            _id: "validClassId",
            professor: [{ user: "validUserId" }],
        };
        const fileBuffer = Buffer.from("file content");

        isIDGood.mockResolvedValue(postId);
        getItemById
            .mockResolvedValueOnce(postMock) // For WallpostPost
            .mockResolvedValueOnce(classMock); // For Class
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(fileBuffer);
        path.join.mockReturnValue("/path/to/" + filename);
        path.extname.mockReturnValue(".jpg");

        const result = await wallpost_get_file_service(postId, filename, req);

        expect(isIDGood).toHaveBeenCalledWith(postId);
        expect(getItemById).toHaveBeenCalledWith(WallpostPost, postId);
        expect(getItemById).toHaveBeenCalledWith(Class, "validClassId", "professor");
        expect(fs.existsSync).toHaveBeenCalledWith("/path/to/validFile.jpg");
        expect(fs.readFileSync).toHaveBeenCalledWith("/path/to/validFile.jpg");
        expect(result).toEqual({ fileBuffer, extension: "image/jpeg" });
    });

    it("should throw 404 error if the post is not found", async () => {
        isIDGood.mockResolvedValue(postId);
        getItemById.mockResolvedValue(null); // Post not found

        await expect(wallpost_get_file_service(postId, filename, req)).rejects.toEqual({
            code: 404,
            message: "Post non trouvé",
        });
    });

    it("should throw 403 error if the file is not authorized", async () => {
        const postMock = {
            _id: postId,
            class: "validClassId",
            source: ["otherFile.jpg"], // Filename not in source
        };

        isIDGood.mockResolvedValue(postId);
        getItemById.mockResolvedValue(postMock);

        await expect(wallpost_get_file_service(postId, filename, req)).rejects.toEqual({
            code: 403,
            message: "Fichier non autorisé",
        });
    });

    it("should throw 404 error if the file does not exist", async () => {
        const postMock = {
            _id: postId,
            class: "validClassId",
            source: [filename],
        };
        const classMock = {
            _id: "validClassId",
            professor: [{ user: "validUserId" }],
        };

        isIDGood.mockResolvedValue(postId);
        getItemById
            .mockResolvedValueOnce(postMock) 
            .mockResolvedValueOnce(classMock); 
        fs.existsSync.mockReturnValue(false); 

        await expect(wallpost_get_file_service(postId, filename, req)).rejects.toEqual({
            code: 404,
            message: "Fichier non trouvé",
        });
    });
});