const { school_update_professors_roles_service } = require("../../../src/controllers/school/services/school-update-professors-roles.service");
const { School, User, Professor, Role } = require("../../../src/models");
const { getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("school_update_professors_roles_service", () => {
    const schoolId = new mongoose.Types.ObjectId();
    const professorId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const mockSchool = {
        _id: schoolId,
        director: { _id: userId.toString() },
        professor: [{ _id: professorId, user: userId }],
        save: jest.fn(),
    };
    const mockProfessor = {
        _id: professorId,
        user: userId,
        role: [],
        save: jest.fn(),
    };
    const req = {
        userId: userId.toString(),
    };

    const professorsData = [
        {
            id: professorId.toString(),
            roles: ["director"]
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update professor roles successfully", async () => {
        const mockProfessor = {
            _id: professorId,
            user: userId,
            save: jest.fn(),
        };

        const mockSchool = {
            _id: schoolId,
            professor: [mockProfessor],
            director: null,
            save: jest.fn(),
        };

        const mockUser = {
            _id: userId,
            roles: [],
            save: jest.fn(),
        };

        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(mockSchool);
        getItemById.mockResolvedValueOnce(mockProfessor); 
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Role.find = jest.fn().mockResolvedValue([{ _id: new mongoose.Types.ObjectId(), name: "director" }]);

        School.findOne = jest.fn().mockResolvedValue(null);

        const result = await school_update_professors_roles_service(schoolId.toString(), professorsData, req);

        expect(mockProfessor.save).toHaveBeenCalled();
        expect(mockSchool.save).toHaveBeenCalled();
        expect(result).toEqual({ code: 200, message: "Professors roles updated successfully" });
    });

    it("should throw 404 if school not found", async () => {
        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(null);

        await expect(school_update_professors_roles_service(schoolId, professorsData, req)).rejects.toEqual({
            code: 404,
            message: "School not found",
        });
    });

    it("should throw 403 if user cannot access the school", async () => {
        isIDGood.mockResolvedValueOnce(schoolId);
        const otherUserId = "other-user-id";
        getItemById.mockResolvedValueOnce({ ...mockSchool, director: { _id: otherUserId } });

        await expect(school_update_professors_roles_service(schoolId, professorsData, req)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this school",
        });
    });

    it("should throw 404 if professor not found", async () => {
        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(mockSchool);
        getItemById.mockResolvedValueOnce(null);

        await expect(school_update_professors_roles_service(schoolId, professorsData, req)).rejects.toEqual({
            code: 404,
            message: "Professor not found",
        });
    });

    it("should throw 403 if professor does not belong to the school", async () => {
        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(mockSchool);
        getItemById.mockResolvedValueOnce({ ...mockProfessor, _id: "another-professor-id" });

        await expect(school_update_professors_roles_service(schoolId, professorsData, req)).rejects.toEqual({
            code: 403,
            message: "This professor does not belong to this school",
        });
    });

    it("should throw 404 if user is not found", async () => {
        isIDGood.mockResolvedValueOnce(schoolId);
        getItemById.mockResolvedValueOnce(mockSchool);
        getItemById.mockResolvedValueOnce(mockProfessor);
        User.findById = jest.fn().mockResolvedValue(null);

        await expect(school_update_professors_roles_service(schoolId, professorsData, req)).rejects.toEqual({
            code: 404,
            message: "User not found",
        });
    });
});