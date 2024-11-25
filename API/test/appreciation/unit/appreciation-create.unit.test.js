const { appreciation_create_service } = require("../../../src/controllers/appreciation/services");
const { Appreciation, Student, Professor } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById, createItem, getOneItem } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/models", () => {
    const mockAppreciation = function (data) {
        return { ...data };
    };

    mockAppreciation.find = jest.fn();

    return {
        Appreciation: mockAppreciation,
        Student: {},
        Professor: {},
    };
});

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    createItem: jest.fn(),
    getOneItem: jest.fn(),
}));

describe('appreciation_create_service', () => {
    const req = { userId: 'professor1', role: 'professor' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create new appreciations successfully', async () => {
        isIDGood.mockResolvedValue('valid-student-id');
        getItemById.mockResolvedValue({
            id: 'valid-student-id',
            class: { _id: 'class1', professor: [{ user: 'professor1' }] },
            level: 'MS',
        });
        Appreciation.find.mockResolvedValue([]);
        getOneItem.mockResolvedValue({ _id: 'professor1-id' });
        createItem.mockResolvedValue({ id: 'appreciation1' });

        const appreciationsData = {
            appreciations: [
                { content: 'Great progress in class!' },
            ]
        };

        const createdAppreciations = await appreciation_create_service('valid-student-id', appreciationsData, req);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const schoolYearStart = currentDate.getMonth() >= 8 ? currentYear : currentYear - 1;
        const expectedStartDate = new Date(schoolYearStart, 8, 1);
        const expectedEndDate = new Date(schoolYearStart + 1, 7, 31);
    
        expect(isIDGood).toHaveBeenCalledWith('valid-student-id');
        expect(getItemById).toHaveBeenCalledWith(Student, 'valid-student-id', { path: "class", populate: { path: "professor" } });
        expect(Appreciation.find).toHaveBeenCalledWith({
            student: 'valid-student-id',
            date: {
                $gte: expectedStartDate,
                $lt: expectedEndDate,
            }
        });
        expect(createItem).toHaveBeenCalledWith(Appreciation, expect.objectContaining({
            student: 'valid-student-id',
            professor: 'professor1-id',
            content: 'Great progress in class!',
            section: 'MS',
            classroom: 'class1',
        }));
        expect(createdAppreciations).toEqual([{ id: 'appreciation1' }]);
    });

    it('should throw an error if student does not exist', async () => {
        isIDGood.mockResolvedValue('valid-student-id');
        getItemById.mockResolvedValue(null);

        const appreciationsData = {
            appreciations: [
                { content: 'Great progress in class!' },
            ]
        };

        await expect(appreciation_create_service('valid-student-id', appreciationsData, req))
            .rejects
            .toEqual({ code: 404, message: "Student not found" });
    });

    it('should throw an error if professor does not have access to the student', async () => {
        isIDGood.mockResolvedValue('valid-student-id');
        getItemById.mockResolvedValue({
            id: 'valid-student-id',
            class: { _id: 'class1', professor: [{ user: 'professor2' }] },
            level: '5th grade',
        });

        const appreciationsData = {
            appreciations: [
                { content: 'Great progress in class!' },
            ]
        };

        await expect(appreciation_create_service('valid-student-id', appreciationsData, req))
            .rejects
            .toEqual({ code: 403, message: "You don't have permission to access this resource" });
    });

    it('should throw an error if more than 3 appreciations are added in the same school year', async () => {
        isIDGood.mockResolvedValue('valid-student-id');
        getItemById.mockResolvedValue({
            id: 'valid-student-id',
            class: { _id: 'class1', professor: [{ user: 'professor1' }] },
            level: '5th grade',
        });
        Appreciation.find.mockResolvedValue([{}, {}, {}]);

        const appreciationsData = {
            appreciations: [
                { content: 'Great progress in class!' },
            ]
        };

        await expect(appreciation_create_service('valid-student-id', appreciationsData, req))
            .rejects
            .toEqual({ code: 400, message: "Cannot create more than three appreciations for the same school year" });
    });
});