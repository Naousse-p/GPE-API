const { Class } = require("../../../src/models");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { classroom_update_service } = require("../../../src/controllers/classroom/services");

jest.mock("../../../src/models", () => ({
    Class: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    updateItem: jest.fn(),
}));

describe("classroom_update_service", () => {
    const req = { userId: "professor1" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the classroom when user has access", async () => {
        const classroomId = "classroom1";
        const updateData = { name: "Updated Classroom Name", level: "MS" };
        const mockClassroom = {
            _id: classroomId,
            professor: [{ user: "professor1" }],
        };
        const mockUpdatedClassroom = { _id: classroomId, name: updateData.name, level: updateData.level };

        getItemById.mockResolvedValueOnce(mockClassroom);
        updateItem.mockResolvedValueOnce(mockUpdatedClassroom);

        const result = await classroom_update_service(classroomId, updateData, req);

        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors");
        expect(updateItem).toHaveBeenCalledWith(Class, { _id: classroomId }, { $set: updateData });
        expect(result).toEqual(mockUpdatedClassroom);
    });

    it("should throw 404 error if classroom is not found", async () => {
        const classroomId = "classroom1";
        const updateData = { name: "Updated Classroom Name", level: "MS" };

        getItemById.mockResolvedValueOnce(null);

        await expect(classroom_update_service(classroomId, updateData, req)).rejects.toEqual({
            code: 404,
            message: "Classroom not found",
        });

        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors");
    });

    it("should throw 403 error if user does not have access to the classroom", async () => {
        const classroomId = "classroom1";
        const updateData = { name: "Updated Classroom Name", level: "MS" };
        const mockClassroom = {
            _id: classroomId,
            professor: [{ user: "professor2" }],
        };

        getItemById.mockResolvedValueOnce(mockClassroom);

        await expect(classroom_update_service(classroomId, updateData, req)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this classroom",
        });

        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors");
    });

    it("should throw 422 error if no data is provided for update", async () => {
        const classroomId = "classroom1";
        const emptyUpdateData = {};
        const mockClassroom = {
            _id: classroomId,
            professor: [{ user: "professor1" }],
        };

        getItemById.mockResolvedValueOnce(mockClassroom);

        await expect(classroom_update_service(classroomId, emptyUpdateData, req)).rejects.toEqual({
            code: 422,
            message: "No data to update",
        });

        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors");
    });

    it("should handle generic errors", async () => {
        const classroomId = "classroom1";
        const updateData = { name: "Updated Classroom Name", level: "MS" };
        const mockClassroom = {
            _id: classroomId,
            professor: [{ user: "professor1" }],
        };

        getItemById.mockResolvedValueOnce(mockClassroom);
        updateItem.mockRejectedValueOnce(new Error("Some error"));

        await expect(classroom_update_service(classroomId, updateData, req)).rejects.toEqual({
            code: 500,
            message: "Some error",
        });

        expect(getItemById).toHaveBeenCalledWith(Class, classroomId, "professor visitors");
    });
});