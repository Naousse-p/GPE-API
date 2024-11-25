const mongoose = require("mongoose");
const { Role, User, Parent, Student } = require("../../../src/models");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { createItemWithSession, getItems, getOneItem, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { sendEmailConfirmation } = require("../../../src/mailer/helpers/send-email-confirmation");
const { generate_validation_token } = require("../../../src/controllers/auth/helpers");
const { signup_parent_service } = require("../../../src/controllers/auth/services");

jest.mock("../../../src/models", () => {
  const UserMock = jest.fn().mockImplementation((userData) => ({
    ...userData,
    save: jest.fn(),
  }));

  const ParentMock = jest.fn().mockImplementation((parentData) => ({
    ...parentData,
    save: jest.fn(),
  }));

  return {
    Role: {},
    User: UserMock,
    Parent: ParentMock,
    Student: {
      save: jest.fn(),
    },
  };
});

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
  isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
  createItemWithSession: jest.fn(),
  getItems: jest.fn(),
  getOneItem: jest.fn(),
  getItemById: jest.fn(),
}));

jest.mock("../../../src/mailer/helpers/send-email-confirmation", () => ({
  sendEmailConfirmation: jest.fn(),
}));

jest.mock("../../../src/controllers/auth/helpers", () => ({
  generate_validation_token: jest.fn(),
}));

describe("signup_parent_service", () => {
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

  it("should signup parent successfully", async () => {
    const userData = { email: "test@gmail.com", password: "password", role: ["parent"] };
    const parentData = { children: { child: "student-id" } };

    const mockUser = { _id: "valid-user-id", email: userData.email, roles: [], save: jest.fn() };
    const mockStudent = { _id: "student-id", parent: [], save: jest.fn() };
    const mockParent = { _id: "parent-id", user: "valid-user-id" };
    const mockRoles = [{ _id: "role-id", name: "parent" }];

    isIDGood.mockResolvedValueOnce("student-id");
    
    getItemById.mockResolvedValueOnce(mockStudent);

    getItems.mockResolvedValueOnce(mockRoles);

    createItemWithSession
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockParent);

    sendEmailConfirmation.mockResolvedValueOnce();

    generate_validation_token.mockReturnValue("mock-validation-token");

    const result = await signup_parent_service(userData, parentData);

    expect(isIDGood).toHaveBeenCalledWith("student-id");
    expect(getItemById).toHaveBeenCalledWith(Student, "student-id", { path: "class", populate: { path: "professor" } });
    expect(getItems).toHaveBeenCalledWith(Role, { name: { $in: userData.role } });
    expect(createItemWithSession).toHaveBeenCalledWith(User, expect.any(Object), session);
    expect(createItemWithSession).toHaveBeenCalledWith(Parent, expect.any(Object), session);
    expect(sendEmailConfirmation).toHaveBeenCalledWith(userData.email, "mock-validation-token");
    expect(mockStudent.save).toHaveBeenCalledWith({ session });
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(result).toEqual({ user: mockUser, parent: mockParent });
  });

  it("should throw an error if student is not found", async () => {
    const userData = { email: "test@gmail.com", password: "password", role: ["parent"] };
    const parentData = { children: { child: "student-id" } };

    isIDGood.mockResolvedValueOnce("student-id");

    getItemById.mockResolvedValueOnce(null);

    await expect(signup_parent_service(userData, parentData)).rejects.toEqual({
      code: 404,
      message: "Student not found",
    });

    expect(session.abortTransaction).toHaveBeenCalled();
  });

  it("should throw a 409 error if email is already used", async () => {
    const userData = { email: "test@gmail.com", password: "password", role: ["parent"] };
    const parentData = { children: { child: "student-id" } };

    getOneItem.mockResolvedValueOnce({ _id: "existing-user-id" });

    await expect(signup_parent_service(userData, parentData)).rejects.toEqual({
      code: 409,
      message: "Email already used",
    });

    expect(session.abortTransaction).toHaveBeenCalled();
  });

  it("should handle errors during the signup process", async () => {
    const userData = { email: "test@gmail.com", password: "password", role: ["parent"] };
    const parentData = { children: { child: "student-id" } };

    createItemWithSession.mockRejectedValueOnce(new Error("Some error"));

    await expect(signup_parent_service(userData, parentData)).rejects.toEqual({
      code: 500,
      message: "Some error",
    });

    expect(session.abortTransaction).toHaveBeenCalled();
  });
});