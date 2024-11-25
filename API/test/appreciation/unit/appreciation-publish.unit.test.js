const { appreciation_publish_service } = require("../../../src/controllers/appreciation/services");
const { Appreciation, Student } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/models", () => ({
    Appreciation: {},
    Student: {
        findById: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    }
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

describe('appreciation_publish_service', () => {
    const req = { userId: 'professor1', role: 'professor' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully publish appreciations for a valid student and valid appreciation IDs', async () => {
        const studentId = 'valid-student-id';
        const appreciationIds = ['valid-appreciation-id-1', 'valid-appreciation-id-2'];

        isIDGood.mockResolvedValue(true);
        Student.findById.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    _id: studentId,
                    class: { professor: [{ user: 'professor1' }] }
                })
            })
        });
        getItemById
            .mockResolvedValueOnce({
                _id: 'valid-appreciation-id-1',
                student: studentId,
                published: false
            })
            .mockResolvedValueOnce({
                _id: 'valid-appreciation-id-2',
                student: studentId,
                published: false
            });
        updateItem
            .mockResolvedValueOnce({ _id: 'valid-appreciation-id-1', published: true })
            .mockResolvedValueOnce({ _id: 'valid-appreciation-id-2', published: true });

        const result = await appreciation_publish_service(studentId, appreciationIds, req.userId);

        expect(isIDGood).toHaveBeenCalledWith(studentId);
        expect(result).toEqual([
            { _id: 'valid-appreciation-id-1', published: true },
            { _id: 'valid-appreciation-id-2', published: true }
        ]);
    });

    it('should throw a 403 error if the professor does not have access to the student', async () => {
        const studentId = 'valid-student-id';
        const appreciationIds = ['valid-appreciation-id-1'];

        isIDGood.mockResolvedValue(true);
        Student.findById.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    _id: studentId,
                    class: { professor: [{ user: 'professor2' }] }
                })
            })
        });

        await expect(appreciation_publish_service(studentId, appreciationIds, req.userId))
            .rejects
            .toEqual({ code: 403, message: "You don't have permission to access this resource" });
    });

    it('should throw a 404 error if the student is not found', async () => {
        const studentId = 'invalid-student-id';
        const appreciationIds = ['valid-appreciation-id-1'];

        isIDGood.mockResolvedValue(true);
        Student.findById.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            })
        });

        await expect(appreciation_publish_service(studentId, appreciationIds, req.userId))
            .rejects
            .toEqual({ code: 404, message: "Student not found" });
    });

    it('should throw a 404 error if an appreciation is not found', async () => {
        const studentId = 'valid-student-id';
        const appreciationIds = ['invalid-appreciation-id'];

        isIDGood.mockResolvedValue(true);
        Student.findById.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    _id: studentId,
                    class: { professor: [{ user: 'professor1' }] }
                })
            })
        });
        getItemById.mockResolvedValueOnce(null);

        await expect(appreciation_publish_service(studentId, appreciationIds, req.userId))
            .rejects
            .toEqual({ code: 404, message: "Appreciation not found" });
    });

    it('should throw a 400 error if the appreciation does not belong to the student', async () => {
        const studentId = 'valid-student-id';
        const appreciationIds = ['valid-appreciation-id'];

        isIDGood.mockResolvedValue(true);
        Student.findById.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    _id: studentId,
                    class: { professor: [{ user: 'professor1' }] }
                })
            })
        });
        getItemById.mockResolvedValueOnce({
            _id: 'valid-appreciation-id',
            student: 'different-student-id',
            published: false
        });

        await expect(appreciation_publish_service(studentId, appreciationIds, req.userId))
            .rejects
            .toEqual({ code: 400, message: "Appreciation with ID true does not belong to the specified student" });
    });
});