const { appreciation_remove_service } = require("../../../src/controllers/appreciation/services");
const { Appreciation, Student } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById, deleteItem } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/models", () => ({
    Appreciation: {},
    Student: {}
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    deleteItem: jest.fn(),
}));

describe('appreciation_remove_service', () => {
    const req = { userId: 'professor1', role: 'professor' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully delete an appreciation', async () => {
        const appreciationId = 'valid-appreciation-id';

        isIDGood.mockResolvedValue(appreciationId);
        getItemById
            .mockResolvedValueOnce({ _id: appreciationId, student: 'valid-student-id' })
            .mockResolvedValueOnce({
                id: 'valid-student-id',
                class: { professor: [{ user: 'professor1' }] },
                parent: []
            });
        deleteItem.mockResolvedValue({});

        const result = await appreciation_remove_service(appreciationId, req);

        expect(isIDGood).toHaveBeenCalledWith(appreciationId);
        expect(getItemById).toHaveBeenNthCalledWith(1, Appreciation, appreciationId);
        expect(getItemById).toHaveBeenNthCalledWith(2, Student, 'valid-student-id', [{ path: "class", populate: { path: "professor" } }, "parent"]);
        expect(deleteItem).toHaveBeenCalledWith(Appreciation, appreciationId);
        expect(result).toEqual({ message: "Appreciation deleted successfully" });
    });

    it('should throw a 404 error if appreciation is not found', async () => {
        const appreciationId = 'invalid-appreciation-id';

        isIDGood.mockResolvedValue(appreciationId);
        getItemById.mockResolvedValueOnce(null);

        await expect(appreciation_remove_service(appreciationId, req))
            .rejects
            .toEqual({ code: 404, message: "Appreciation not found" });
    });

    it('should throw a 403 error if the user does not have permission to delete the appreciation', async () => {
        const appreciationId = 'valid-appreciation-id';

        isIDGood.mockResolvedValue(appreciationId);
        getItemById
            .mockResolvedValueOnce({ _id: appreciationId, student: 'valid-student-id' })
            .mockResolvedValueOnce({
                id: 'valid-student-id',
                class: { professor: [{ user: 'other-professor' }] },
                parent: []
            });

        await expect(appreciation_remove_service(appreciationId, req))
            .rejects
            .toEqual({ code: 403, message: "You don't have permission to access this resource" });
    });

    it('should throw a 404 error if student is not found', async () => {
        const appreciationId = 'valid-appreciation-id';

        isIDGood.mockResolvedValue(appreciationId);
        getItemById
            .mockResolvedValueOnce({ _id: appreciationId, student: 'valid-student-id' })
            .mockResolvedValueOnce(null);

        await expect(appreciation_remove_service(appreciationId, req))
            .rejects
            .toEqual({ code: 404, message: "Student not found" });
    });
});