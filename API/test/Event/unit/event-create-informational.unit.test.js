const { event_create_informational_service } = require("../../../src/controllers/event/services");
const { Event, Class, School } = require("../../../src/models");
const { createItem, getItemById, getItems } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");

jest.mock("../../../src/models", () => ({
    Event: {},
    Class: {},
    School: {
        findById: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue({
            professor: [{ user: "valid-user-id" }]
        }),
    },
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    createItem: jest.fn(),
    getItemById: jest.fn(),
    getItems: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

describe("event_create_informational_service", () => {
    const req = { userId: "valid-user-id" };
    const classId = "valid-class-id";
    const datas = {
        title: "Information Event",
        date: "2024-09-23",
        startTime: "2024-09-23T09:00:00Z",
        endTime: "2024-09-23T12:00:00Z",
        description: "Event description",
        isVisible: true,
        sharedWithParents: ["valid-parent-id"]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create an informational event successfully", async () => {
        const mockClass = {
            _id: classId,
            professor: [{ user: req.userId }],
            school: "valid-school-id",
        };

        const mockEvent = { _id: "event-id", title: datas.title };

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getItems.mockResolvedValueOnce([]);
        createItem.mockResolvedValueOnce(mockEvent);

        const result = await event_create_informational_service(datas, classId, req);

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor school");
        expect(getItems).toHaveBeenCalledWith(Event, expect.any(Object));
        expect(createItem).toHaveBeenCalledWith(Event, expect.any(Object));
        expect(result).toEqual({ conflict: false, event: mockEvent });
    });

    it("should throw an error if the class is not found", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(null);  // Classe non trouvée

        await expect(event_create_informational_service(datas, classId, req)).rejects.toEqual({
            code: 404,
            message: "Classe non trouvée",
        });
    });

    it("should throw a conflict error if a schedule conflict is detected", async () => {
        const mockClass = {
            _id: classId,
            professor: [{ user: req.userId }],
            school: "valid-school-id",
        };

        const mockConflictingEvent = [{ _id: "event-in-conflict" }];

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getItems.mockResolvedValueOnce(mockConflictingEvent);

        const result = await event_create_informational_service(datas, classId, req);

        expect(result).toEqual({
            conflict: true,
            conflicts: mockConflictingEvent,
        });
    });
});