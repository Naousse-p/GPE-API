const { event_get_available_contact_service } = require("../../../src/controllers/event/services");
const { Class, Professor, Parent, School } = require("../../../src/models");
const { getItemById, getItems, getOneItem } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getItemById: jest.fn(),
    getItems: jest.fn(),
    getOneItem: jest.fn(),
}));

describe("event_get_available_contact_service", () => {
    const reqProfessor = { userId: "professor-id", role: ["professor"] };
    const reqParent = { userId: "parent-id", role: ["parents"] };
    const classId = "class-id";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should retrieve parents and professors if user is a professor", async () => {
        const mockParents = [
            { _id: "parent1", firstname: "John", lastname: "Doe" },
            { _id: "parent2", firstname: "Jane", lastname: "Smith" },
        ];

        const mockProfessors = [
            { _id: "prof1", firstname: "Alice", lastname: "Johnson", user: "prof1-id" },
            { _id: "prof2", firstname: "Bob", lastname: "Lee", user: "prof2-id" },
        ];

        const mockClassItem = { school: "school-id" };
        const mockSchool = { professor: ["prof1-id", "prof2-id"] };

        getItems.mockResolvedValueOnce(mockParents);
        getItemById.mockResolvedValueOnce(mockClassItem);
        getItemById.mockResolvedValueOnce(mockSchool);
        getItems.mockResolvedValueOnce(mockProfessors);

        const result = await event_get_available_contact_service(reqProfessor, classId);

        expect(getItems).toHaveBeenCalledWith(Parent, { children: { $elemMatch: { class: classId } } });
        expect(getItems).toHaveBeenCalledWith(Professor, { _id: { $in: mockSchool.professor } }, "firstname lastname");

        expect(result).toEqual({
            parents: [
                { _id: "parent1", name: "John Doe" },
                { _id: "parent2", name: "Jane Smith" },
            ],
            professors: [
                { _id: "prof1", name: "Alice Johnson", role: undefined },
                { _id: "prof2", name: "Bob Lee", role: undefined },
            ],
        });
    });

    // it("should retrieve teachers and director if user is a parent", async () => {
    //     const mockTeachers = [
    //         { _id: "teacher1", firstname: "Teacher1", lastname: "LastName1" },
    //         { _id: "teacher2", firstname: "Teacher2", lastname: "LastName2" },
    //     ];

    //     const mockClassItem = { school: "school-id", professor: ["teacher1", "teacher2"] };
    //     const mockSchool = { director: "director-id" };
    //     const mockDirector = { _id: "director-id", firstname: "Director", lastname: "LastName" };

    //     getItemById.mockResolvedValueOnce(mockClassItem);
    //     getItemById.mockResolvedValueOnce(mockSchool);
    //     getOneItem.mockResolvedValueOnce(mockDirector);
    //     getItems.mockResolvedValueOnce(mockTeachers);

    //     const result = await event_get_available_contact_service(reqParent, classId);

    //     expect(getItems).toHaveBeenCalledWith(Professor, { _id: { $in: mockClassItem.professor } }, "firstname lastname");

    //     expect(result).toEqual({
    //         teachers: [
    //             { _id: "teacher1", name: "Teacher1 LastName1" },
    //             { _id: "teacher2", name: "Teacher2 LastName2" },
    //         ],
    //         director: {
    //             _id: "director-id",
    //             name: "Director LastName",
    //         },
    //     });
    // });

    it("should throw an error for unauthorized role", async () => {
        const reqUnauthorized = { userId: "user-id", role: ["student"] };

        await expect(event_get_available_contact_service(reqUnauthorized, classId)).rejects.toEqual({
            code: 403,
            message: "Rôle utilisateur non autorisé",
        });
    });
});