const { parent_join_classroom_service } = require("../../../src/controllers/parent/services");
const { Parent, Student } = require("../../../src/models");
const { getOneItem, updateItem } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
    updateItem: jest.fn(),
}));

describe("parent_join_classroom_service", () => {
    const studentCode = "valid-student-code";
    const relationShip = "Father";
    const req = { userId: "valid-parent-id" };

    const mockStudent = {
        _id: "valid-student-id",
        code: studentCode,
        class: { _id: "valid-class-id" },
        parent: [],
        save: jest.fn(),
    };

    const mockParent = {
        _id: "valid-parent-id",
        user: req.userId,
        children: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should add the parent to the classroom successfully", async () => {
        getOneItem.mockResolvedValueOnce(mockStudent);
        getOneItem.mockResolvedValueOnce(mockParent);

        const result = await parent_join_classroom_service(studentCode, relationShip, req);

        expect(getOneItem).toHaveBeenCalledWith(Student, { code: studentCode }, { path: "class" });
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: req.userId });
        expect(updateItem).toHaveBeenCalledWith(Parent, mockParent._id, { children: [{ child: mockStudent._id, class: mockStudent.class._id, relationship: relationShip }] });
        expect(mockStudent.parent).toContain(mockParent._id);
        expect(mockStudent.save).toHaveBeenCalled();
        expect(result).toEqual({ code: 200, message: "Parent joined classroom successfully" });
    });

    it("should throw a 404 error if the student is not found", async () => {
        getOneItem.mockResolvedValueOnce(null);

        await expect(parent_join_classroom_service(studentCode, relationShip, req)).rejects.toEqual({
            code: 404,
            message: "Student not found",
        });

        expect(getOneItem).toHaveBeenCalledWith(Student, { code: studentCode }, { path: "class" });
    });

    it("should throw a 404 error if the parent is not found", async () => {
        getOneItem.mockResolvedValueOnce(mockStudent);
        getOneItem.mockResolvedValueOnce(null);

        await expect(parent_join_classroom_service(studentCode, relationShip, req)).rejects.toEqual({
            code: 404,
            message: "Parent not found",
        });

        expect(getOneItem).toHaveBeenCalledWith(Student, { code: studentCode }, { path: "class" });
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: req.userId });
    });
});
