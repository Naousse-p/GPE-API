const mongoose = require("mongoose");
const { Role, School, Professor, Class, User } = require("../../../src/models");
const { createItemWithSession, getItems, getOneItem } = require("../../../src/utils/db-generic-services.utils");
const { sendEmailConfirmation } = require("../../../src/mailer/helpers/send-email-confirmation");
const { generate_validation_token } = require("../../../src/controllers/auth/helpers");
const { signup_professor_service } = require("../../../src/controllers/auth/services");

jest.mock("../../../src/models", () => {
    const RoleMock = jest.fn().mockImplementation((roleData) => ({
        ...roleData,
        save: jest.fn(),
    }));

    const UserMock = jest.fn().mockImplementation((userData) => ({
        ...userData,
        save: jest.fn(),
    }));

    const ProfessorMock = jest.fn().mockImplementation((professorData) => ({
        ...professorData,
        save: jest.fn(),
    }));

    const SchoolMock = jest.fn().mockImplementation((schoolData) => ({
        ...schoolData,
        save: jest.fn(),
    }));

    const ClassMock = jest.fn().mockImplementation((classData) => ({
        ...classData,
        save: jest.fn(),
    }));

    return {
        Role: RoleMock,
        School: SchoolMock,
        User: UserMock,
        Professor: ProfessorMock,
        Class: ClassMock,
    };
});

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    createItemWithSession: jest.fn(),
    getItems: jest.fn(),
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/mailer/helpers/send-email-confirmation", () => ({
    sendEmailConfirmation: jest.fn(),
}));

jest.mock("../../../src/controllers/auth/helpers", () => ({
    generate_validation_token: jest.fn(),
}));

describe("signup_professor_service", () => {
    let session;

    beforeEach(() => {
        session = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
        };

        jest.clearAllMocks();
        mongoose.startSession = jest.fn().mockResolvedValue(session);
    });

    it("should signup professor successfully", async () => {
        const userData = { email: "prof@example.com", password: "password", role: ["professor"] };
        const schoolData = { school_type: "new", schoolCode: "12345", schoolName: "Test School", schoolAddress: "123 Street", schoolCity: "City", schoolPostal_code: "12345", schoolPhone: "1234567890" };
        const professorData = { firstname: "jac", lastname: "li", phoneNumber: "1234567890" };
        const classData = { class_type: "new", name: "Class A", level: "5", code: "CLASS-A" };

        const mockUser = { _id: "valid-user-id", email: userData.email, roles: [], save: jest.fn() };
        const mockProfessor = { _id: "professor-id", save: jest.fn() };
        const mockSchool = { _id: "school-id", professor: [], save: jest.fn() };
        const mockClass = { _id: "class-id", professor: [], save: jest.fn() };
        const mockRoles = [{ _id: "role-id", name: "professor" }];

        getItems.mockResolvedValueOnce(mockRoles);

        createItemWithSession
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce(mockProfessor)
            .mockResolvedValueOnce(mockSchool)
            .mockResolvedValueOnce(mockClass);

        sendEmailConfirmation.mockResolvedValueOnce();

        generate_validation_token.mockReturnValue("mock-validation-token");

        const result = await signup_professor_service(userData, schoolData, professorData, classData);

        expect(getItems).toHaveBeenCalledWith(Role, { name: { $in: userData.role } });
        expect(createItemWithSession).toHaveBeenCalledWith(User, expect.any(Object), session);
        expect(createItemWithSession).toHaveBeenCalledWith(School, expect.any(Object), session);
        expect(createItemWithSession).toHaveBeenCalledWith(Class, expect.any(Object), session);
        expect(mockSchool.save).toHaveBeenCalledWith({ session });
        expect(session.commitTransaction).toHaveBeenCalled();
        expect(result).toEqual({ user: mockUser, school: mockSchool, professor: mockProfessor, class: mockClass });
    });

    it("should throw an error if email is already used", async () => {
        const userData = { email: "professor@example.com", password: "password", role: [{ _id: "valid-professor-id"}] };
        const schoolData = { school_type: "new", schoolCode: "12345", schoolName: "Test School", schoolAddress: "123 Street", schoolCity: "City", schoolPostal_code: "12345", schoolPhone: "1234567890" };
        const professorData = { firstname: "jac", lastname: "li", phoneNumber: "1234567890" };
        const classData = { class_type: "new", name: "Class A", level: "5", code: "CLASS-A" };
        const mockRole = [{ _id: "valid-role-id", roles: ["professor"], save: jest.fn() }];

        getOneItem.mockResolvedValueOnce(userData);
        getItems.mockResolvedValueOnce(mockRole);
        getOneItem.mockResolvedValueOnce({ _id: "existing-school-id" });

        await expect(signup_professor_service(userData, schoolData, professorData, classData)).rejects.toEqual({
            code: 409,
            message: "Email already used",
        });

        expect(session.abortTransaction).toHaveBeenCalled();
    });
});