const { Parent, User, Professor, Class, School } = require("../../../src/models");
const { getOneItem, getItems } = require("../../../src/utils/db-generic-services.utils");
const { classroom_user_service } = require("../../../src/controllers/classroom/services");

jest.mock("../../../src/models", () => ({
    Parent: jest.fn(),
    User: jest.fn(),
    Professor: jest.fn(),
    Class: jest.fn(),
    School: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
    getItems: jest.fn(),
}));

describe("classroom_user_service", () => {
    const req = { userId: "user1", role: ["parents"] };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return classrooms for a parent", async () => {
        const mockUser = { _id: "user1" };
        const mockParent = {
            user: "user1",
            children: [
                {
                    child: { _id: "child1", firstname: "jac" },
                    class: { _id: "class1", name: "Class A", school: { _id: "school1", name: "School A", code: "Test1" } },
                },
            ],
        };
        const expectedResult = [
            {
                schoolId: "school1",
                schoolName: "School A",
                schoolCode: "Test1",
                classes: [
                    { className: "Class A", child: "jac", classId: "class1", student_id: "child1" },
                ],
            },
        ];

        getOneItem.mockResolvedValueOnce(mockUser);
        getOneItem.mockResolvedValueOnce(mockParent);

        const result = await classroom_user_service(req);

        expect(getOneItem).toHaveBeenCalledWith(User, { _id: "user1" });
        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: "user1" }, expect.any(Object));
        expect(result).toEqual(expectedResult);
    });

    it("should throw a 404 error if the user is not found", async () => {
        getOneItem.mockResolvedValueOnce(null);

        await expect(classroom_user_service(req)).rejects.toEqual({
            code: 404,
            message: "User not found",
        });
    });

    it("should throw a 404 error if parent is not found", async () => {
        const mockUser = { _id: "user1" };
        getOneItem.mockResolvedValueOnce(mockUser);
        getOneItem.mockResolvedValueOnce(null);

        await expect(classroom_user_service(req)).rejects.toEqual({
            code: 404,
            message: "Parent not found",
        });

        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: "user1" }, expect.any(Object));
    });

    it("should throw a 403 error if parent access is denied", async () => {
        const mockUser = { _id: "user1" };
        const mockParent = { user: "user2", children: [] };

        getOneItem.mockResolvedValueOnce(mockUser);
        getOneItem.mockResolvedValueOnce(mockParent);

        await expect(classroom_user_service(req)).rejects.toEqual({
            code: 403,
            message: "You are not allowed to access this parent",
        });
    });
});