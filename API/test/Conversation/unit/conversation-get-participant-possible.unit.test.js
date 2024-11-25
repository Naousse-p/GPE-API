const { conversation_get_participant_possible_service } = require("../../../src/controllers/conversation/services");
const { Class, Parent } = require("../../../src/models");
const { getOneItem, getItems } = require("../../../src/utils/db-generic-services.utils");
const mongoose = require("mongoose");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/models", () => ({
    Class: {},
    Parent: {},
}));

describe("conversation_get_participant_possible_service", () => {
    const req = { userId: new mongoose.Types.ObjectId().toString(), role: ["professor"] };
    const classId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a list of parents and teachers excluding the current professor", async () => {
        const mockParents = [
            { user: new mongoose.Types.ObjectId().toString(), lastname: "Test1", firstname: "Testjo" },
            { user: new mongoose.Types.ObjectId().toString(), lastname: "Test2", firstname: "Testjojo" },
        ];

        const mockTeacher = {
            professor: [
                { user: req.userId, lastname: "Teacher", firstname: "Current" }, 
                { user: new mongoose.Types.ObjectId().toString(), lastname: "Test3", firstname: "Testjojojo" },
            ],
        };

        getItems.mockResolvedValueOnce(mockParents);
        getOneItem.mockResolvedValueOnce(mockTeacher);

        const result = await conversation_get_participant_possible_service(classId, req);

        expect(getItems).toHaveBeenCalledWith(Parent, { children: { $elemMatch: { class: classId } } });
        expect(getOneItem).toHaveBeenCalledWith(Class, { _id: classId }, { path: "professor" });

        expect(result.parents).toHaveLength(2);
        expect(result.teachers).toHaveLength(1);
        expect(result.teachers[0].lastname).toBe("Test3");
    });

    it("should return an empty list if no parents or teachers are found", async () => {
        getItems.mockResolvedValueOnce([]);
        getOneItem.mockResolvedValueOnce(null); 

        const result = await conversation_get_participant_possible_service(classId, req);

        expect(result.parents).toHaveLength(0);
        expect(result.teachers).toHaveLength(0);
    });

    it("should exclude the current parent from the list if user role is 'parent'", async () => {
        const reqWithParentRole = { userId: "valid-parent-id", role: ["parents"] };
        const mockParents = [
            { user: "valid-parent-id", lastname: "Test1", firstname: "Testjo" },
            { user: new mongoose.Types.ObjectId().toString(), lastname: "Test2", firstname: "Testjojo" },
        ];

        getItems.mockResolvedValueOnce(mockParents);
        getOneItem.mockResolvedValueOnce(null); 

        const result = await conversation_get_participant_possible_service(classId, reqWithParentRole);

        expect(result.parents).toHaveLength(1);
        expect(result.parents[0].lastname).toBe("Test2"); 
        expect(result.teachers).toHaveLength(0);
    });
});