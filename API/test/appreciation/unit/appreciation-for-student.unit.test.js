const { appreciation_for_student_service } = require("../../../src/controllers/appreciation/services");
const { Appreciation, Student } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");


jest.mock("../../../src/models", () => ({
    Appreciation: {
        find: jest.fn(),
    },
    Student: {}
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware.js", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils.js", () => ({
    getItemById: jest.fn(),
}));

describe('appreciation_for_student_service', () => {
    const req = { userId: 'user1', role: 'parents' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return appreciations for a valid student ID and role', async () => {
        isIDGood.mockResolvedValue('valid-student-id');
        getItemById.mockResolvedValue({
            id: 'valid-student-id',
            parent: [{ user: 'user1' }],
            class: { professor: [{ user: 'user2' }] }
        });
        Appreciation.find.mockResolvedValue([{ id: 'appreciation1' }]);

        const appreciations = await appreciation_for_student_service('valid-student-id', req);

        expect(isIDGood).toHaveBeenCalledWith('valid-student-id');
        expect(getItemById).toHaveBeenCalledWith(Student, 'valid-student-id', [{ path: "class", populate: { path: "professor" } }, "parent"]);
        expect(Appreciation.find).toHaveBeenCalledWith(expect.objectContaining({
            student: 'valid-student-id',
            date: expect.any(Object),
            published: true
        }));
        expect(appreciations).toEqual([{ id: 'appreciation1' }]);
    });

    it('should throw a 404 error if student is not found', async () => {
        isIDGood.mockResolvedValue('valid-student-id');
        getItemById.mockResolvedValue(null);

        await expect(appreciation_for_student_service('valid-student-id', req))
            .rejects
            .toEqual({ code: 404, message: "Student not found" });
    });

    it('should throw a 403 error if the user does not have permission', async () => {
        isIDGood.mockResolvedValue('valid-student-id');
        getItemById.mockResolvedValue({
            id: 'valid-student-id',
            parent: [{ user: 'user2' }],
            class: { professor: [{ user: 'user2' }] }
        });

        await expect(appreciation_for_student_service('valid-student-id', req))
            .rejects
            .toEqual({ code: 403, message: "You don't have permission to access this resource" });
    });

    it('should throw an error if student ID is invalid', async () => {
        isIDGood.mockRejectedValue(new Error('Invalid student ID'));

        await expect(appreciation_for_student_service('invalid-student-id', req))
            .rejects
            .toEqual({ code: 500, message: 'Invalid student ID' });
    });
});