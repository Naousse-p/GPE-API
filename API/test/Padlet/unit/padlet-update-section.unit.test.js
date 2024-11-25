const { padlet_update_section_service } = require("../../../src/controllers/padlet/services");
const { PadletSection } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/models", () => ({
    PadletSection: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("Functional Test - padlet_update_section_service", () => {
    const sectionId = "valid-section-id";
    const req = { userId: "valid-user-id" };
    const mockSection = {
        _id: sectionId,
        board: { class: { professor: [{ user: req.userId }] } },
        title: "Original Title",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the section title successfully", async () => {
        const datas = { title: "Updated Section Title" };

        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(mockSection);
        updateItem.mockResolvedValueOnce({ ...mockSection, title: datas.title });

        const result = await padlet_update_section_service(datas, sectionId, req);

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).toHaveBeenCalledWith(PadletSection, sectionId, { title: "Updated Section Title" });
        expect(result).toEqual({ ...mockSection, title: "Updated Section Title" });
    });

    it("should throw a 403 error if the user does not have permission to update the section", async () => {
        const reqWithoutPermission = { userId: "invalid-user-id" };
        const mockSectionWithoutPermission = {
            _id: sectionId,
            board: { class: { professor: [{ user: "another-user-id" }] } },
        };

        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(mockSectionWithoutPermission);

        await expect(padlet_update_section_service({}, sectionId, reqWithoutPermission)).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).not.toHaveBeenCalled();
    });

    it("should throw a 404 error if the section is not found", async () => {
        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(null);

        await expect(padlet_update_section_service({}, sectionId, req)).rejects.toEqual({
            code: 404,
            message: "Section not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).not.toHaveBeenCalled();
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const datas = { title: "New Section Title" };
        const unexpectedError = new Error("Unexpected error");

        isIDGood.mockResolvedValueOnce(sectionId);
        getItemById.mockResolvedValueOnce(mockSection);
        updateItem.mockRejectedValueOnce(unexpectedError);

        await expect(padlet_update_section_service(datas, sectionId, req)).rejects.toEqual({
            code: 500,
            message: "Unexpected error",
        });

        expect(isIDGood).toHaveBeenCalledWith(sectionId);
        expect(getItemById).toHaveBeenCalledWith(PadletSection, sectionId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
        expect(updateItem).toHaveBeenCalledWith(PadletSection, sectionId, { title: "New Section Title" });
    });
});