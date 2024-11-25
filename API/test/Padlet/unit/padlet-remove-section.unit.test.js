const { padlet_section_remove_service } = require("../../../src/controllers/padlet/services");
const { PadletPost, PadletSection } = require("../../../src/models");
const { getItemById, deleteItem, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("fs");

describe("padlet_section_remove_service", () => {
    const sectionId = "valid-section-id";
    const req = { userId: "valid-user-id", role: "professor" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully remove a section and its posts when the user has permission", async () => {
        const mockSection = {
            _id: sectionId,
            board: {
                class: { professor: [{ user: req.userId }] },
            },
        };
        const mockPosts = [
            { _id: "post-1", source: "file1.pdf" },
            { _id: "post-2", source: "file2.pdf" },
        ];

        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(mockSection);
        getItems.mockResolvedValueOnce(mockPosts);
        fs.existsSync.mockReturnValue(true);

        const result = await padlet_section_remove_service(sectionId, req);

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(getItems).toHaveBeenCalledWith(PadletPost, { sectionId });
        expect(deleteItem).toHaveBeenCalledWith(PadletPost, "post-1");
        expect(deleteItem).toHaveBeenCalledWith(PadletPost, "post-2");
        expect(deleteItem).toHaveBeenCalledWith(PadletSection, sectionId);
        expect(result).toEqual({ message: "Section deleted successfully" });
    });

    it("should throw a 403 error if the user has a parent role", async () => {
        const reqParent = { userId: "parent-id", role: "parents" };

        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce({});

        await expect(padlet_section_remove_service(sectionId, reqParent)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to do this",
        });

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(deleteItem).not.toHaveBeenCalled();
    });

    it("should throw a 403 error if the user does not have permission", async () => {
        const mockSection = {
            _id: sectionId,
            board: { class: { professor: [{ user: "another-user-id" }] } },
        };

        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(mockSection);

        await expect(padlet_section_remove_service(sectionId, req)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(deleteItem).not.toHaveBeenCalled();
    });

    it("should throw a 404 error if the section is not found", async () => {
        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_section_remove_service(sectionId, req)).rejects.toEqual({
            code: 404,
            message: "Section not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(deleteItem).not.toHaveBeenCalled();
    });
});