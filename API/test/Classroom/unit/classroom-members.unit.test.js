const { classroom_members_service } = require("../../../src/controllers/classroom/services");
const { Class, Student, Parent, School } = require("../../../src/models");
const { getItems, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/models", () => ({
    Class: jest.fn(),
    Student: jest.fn(),
    Parent: {
        populate: jest.fn(),
    },
    School: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItems: jest.fn(),
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("classroom_members_service", () => {
    const req = { userId: "professor1" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return classroom members when user has access", async () => {
        const classroomId = "classroom1";
        const mockClassroom = {
            _id: classroomId,
            professor: [{ user: "professor1" }],
            visitors: [],
            school: "school1",
        };
        const mockStudents = [
            { _id: "student1", parent: [{ user: { email: "parent1@example.com", lastLogin: "2023-09-01" } }] },
            { _id: "student2", parent: [{ user: { email: "parent2@example.com", lastLogin: "2023-08-01" } }] },
        ];

        isIDGood.mockReturnValue(true);
        getItemById.mockResolvedValueOnce(mockClassroom);
        getItems.mockResolvedValueOnce(mockStudents);

        Parent.populate.mockResolvedValueOnce(mockStudents);

        const result = await classroom_members_service(classroomId, req);

        expect(isIDGood).toHaveBeenCalledWith(classroomId);
        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors school");
        expect(getItems).toHaveBeenCalledWith(Student, { class: classroomId }, "parent");
        expect(Parent.populate).toHaveBeenCalledWith(mockStudents, {
            path: "parent.user",
            select: "email lastLogin",
        });

        expect(result).toEqual(mockStudents);
    });

    it("should throw 404 error if classroom does not exist", async () => {
        const classroomId = "invalidClassroomId";

        isIDGood.mockReturnValue(true);
        getItemById.mockResolvedValueOnce(null);

        await expect(classroom_members_service(classroomId, req)).rejects.toEqual({
            code: 404,
            message: "Classroom not found",
        });

        expect(isIDGood).toHaveBeenCalledWith(classroomId);
        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors school");
    });

    it("should throw 403 error if user does not have access to the classroom", async () => {
        const classroomId = "classroom1";
        const mockClassroom = {
            _id: classroomId,
            professor: [{ user: "professor2" }],
            visitors: [{ user: "professor1" }],
            school: "school1",
        };
        const mockStudents = [
            { _id: "student1", parent: [{ user: { email: "parent1@example.com", lastLogin: "2023-09-01" } }] },
            { _id: "student2", parent: [{ user: { email: "parent2@example.com", lastLogin: "2023-08-01" } }] },
        ];

        isIDGood.mockReturnValue(true);
        getItemById.mockResolvedValueOnce(mockClassroom);
        getItems.mockResolvedValueOnce(mockStudents);

        Parent.populate.mockResolvedValueOnce(mockStudents);

        const result = await classroom_members_service(classroomId, req);

        expect(isIDGood).toHaveBeenCalledWith(classroomId);
        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors school");
        expect(getItems).toHaveBeenCalledWith(Student, { class: classroomId }, "parent");
        expect(result).toEqual(mockStudents);
    });

    it("sould throw access in the classroom if is director", async () => {
        const classroomId = "classroom1";
        const mockClassroom = {
            _id: classroomId,
            professor: [{ user: "professor2" }],
            visitors: [],
            school: "school1",
        };
        const mockSchool = { _id: "school1", director: "professor1" };
        const mockStudents = [
            { _id: "student1", parent: [{ user: { email: "parent1@example.com", lastLogin: "2023-09-01" } }] },
            { _id: "student2", parent: [{ user: { email: "parent2@example.com", lastLogin: "2023-08-01" } }] },
        ];

        isIDGood.mockReturnValue(true);
        getItemById.mockResolvedValueOnce(mockClassroom);
        getItemById.mockResolvedValueOnce(mockSchool);
        getItems.mockResolvedValueOnce(mockStudents);

        Parent.populate.mockResolvedValueOnce(mockStudents);

        const result = await classroom_members_service(classroomId, req);

        expect(isIDGood).toHaveBeenCalledWith(classroomId);
        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors school");
        expect(getItemById).toHaveBeenCalledWith(School, mockClassroom.school);
        expect(getItems).toHaveBeenCalledWith(Student, { class: classroomId }, "parent");
        expect(result).toEqual(mockStudents);
    });
});