const { event_get_all_type_service } = require("../../../src/controllers/event/services");
const { Event, Professor, Parent } = require("../../../src/models");
const { getOneItem, getItems } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/models", () => ({
    Event: {},
    Professor: {},
    Parent: {},
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
    getItems: jest.fn(),
}));

describe("event_get_all_type_service", () => {
    const classId = "valid-class-id";
    const reqProfessor = { userId: "professor-id", role: ["professor"] };
    const reqParent = { userId: "parent-id", role: ["parents"] };

    beforeEach(() => {
        jest.clearAllMocks();
    });

        it("should retrieve events for professor", async () => {
        const mockProfessor = { _id: "professor-id", user: "professor-id" };
        const mockAppointmentEvents = [
            { eventType: "appointment", professor: "professor-id", toObject: jest.fn().mockReturnValue({}) },
        ];
        const mockPersonalAndInformationalEvents = [
            { eventType: "personal", professor: "professor-id", toObject: jest.fn().mockReturnValue({}) },
            { eventType: "informational", class: classId, toObject: jest.fn().mockReturnValue({}) },
        ];

        getOneItem.mockResolvedValueOnce(mockProfessor);
        getItems
            .mockResolvedValueOnce(mockAppointmentEvents)
            .mockResolvedValueOnce(mockPersonalAndInformationalEvents);

        const result = await event_get_all_type_service(reqProfessor, classId);

        const transformedAppointmentEvents = mockAppointmentEvents.map((event) => ({
            ...event.toObject(),
            isCreator: event.professor === reqProfessor.userId,
        }));

        const transformedPersonalAndInformationalEvents = mockPersonalAndInformationalEvents.map((event) => ({
            ...event.toObject(),
            isCreator: event.professor === reqProfessor.userId,
        }));

        expect(getOneItem).toHaveBeenCalledWith(Professor, { user: "professor-id" });
        expect(getItems).toHaveBeenCalledWith(
            Event,
            {
                eventType: "appointment",
                $or: [{ professor: "professor-id" }, { sharedWithProfessors: "professor-id" }],
            },
            "sharedWithParents sharedWithProfessors"
        );
        expect(getItems).toHaveBeenCalledWith(
            Event,
            {
                eventType: { $in: ["personal", "informational"] },
                $or: [{ professor: "professor-id" }, { class: classId }, { sharedWithProfessors: "professor-id" }],
            },
            "sharedWithParents sharedWithProfessors"
        );
        expect(result).toEqual([...transformedAppointmentEvents, ...transformedPersonalAndInformationalEvents]);
    });

    it("should retrieve events for parent", async () => {
        const mockParent = { _id: "parent-id" };
        const mockAppointmentEvents = [
            {
                eventType: "appointment",
                parent: { user: "parent-id" },
                sharedWithParents: [{ firstname: "John", lastname: "Doe" }],
                toObject: jest.fn().mockReturnValue({}),
            },
        ];
        const mockInformationalEvents = [{ eventType: "informational", class: classId, isVisible: true }];

        getOneItem.mockResolvedValueOnce(mockParent);
        getItems
            .mockResolvedValueOnce(mockAppointmentEvents)
            .mockResolvedValueOnce(mockInformationalEvents);

        const result = await event_get_all_type_service(reqParent, classId);

        const transformedAppointmentEvents = mockAppointmentEvents.map((event) => ({
            ...event.toObject(),
            sharedWithParents: event.sharedWithParents.map((parent) => ({
                firstname: parent.firstname,
                lastname: parent.lastname,
            })),
            isCreator: event.parent?.user === reqParent.userId,
        }));

        expect(getOneItem).toHaveBeenCalledWith(Parent, { user: "parent-id" });
        expect(getItems).toHaveBeenCalledWith(
            Event,
            {
                eventType: "appointment",
                $or: [{ parent: mockParent._id }, { sharedWithParents: mockParent._id }],
            },
            "sharedWithParents professor sharedWithProfessors parent"
        );
        expect(getItems).toHaveBeenCalledWith(Event, {
            eventType: "informational",
            class: classId,
            isVisible: true,
        });
        expect(result).toEqual([...transformedAppointmentEvents, ...mockInformationalEvents]);
    });

    it("should throw an error for unauthorized role", async () => {
        const reqUnauthorized = { userId: "unauthorized-id", role: ["student"] };

        await expect(event_get_all_type_service(reqUnauthorized, classId)).rejects.toEqual({
            code: 403,
            message: "Rôle utilisateur non autorisé",
        });
    });
});