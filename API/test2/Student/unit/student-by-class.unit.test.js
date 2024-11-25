const { student_by_class_service } = require("../../../src/controllers/student/services");
const { Student, Class } = require("../../../src/models");
const { getItemById, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("student_by_class_service", () => {
    const classId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { userId: userId.toString() };
    const mockClass = {
        _id: classId,
        professor: [{ user: userId }],
    };
    const mockStudents = [
        { _id: new mongoose.Types.ObjectId(), name: "Student 1" },
        { _id: new mongoose.Types.ObjectId(), name: "Student 2" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the list of students in the class if the user has permission", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getItems.mockResolvedValueOnce(mockStudents);

        const result = await student_by_class_service(classId.toString(), req);

        expect(isIDGood).toHaveBeenCalledWith(classId.toString());
        expect(result).toEqual(mockStudents);
    });

    it("should throw a 404 error if the class is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);

        await expect(student_by_class_service(classId.toString(), req)).rejects.toEqual({
            code: 404,
            message: "Class not found",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        const error = new Error("Unexpected error");
        isIDGood.mockRejectedValueOnce(error);

        await expect(student_by_class_service(classId.toString(), req)).rejects.toEqual({
            code: 500,
            message: error.message,
        });
    });
});