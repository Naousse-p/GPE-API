const bcrypt = require("bcryptjs");
const { User } = require("../../../src/models");
const { generate_token, generate_refresh_token } = require("../../../src/controllers/auth/helpers");
const { signin_service } = require("../../../src/controllers/auth/services");

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("../../../src/models", () => ({
  User: {
    save: jest.fn(),
  },
}));

jest.mock("../../../src/controllers/auth/helpers", () => ({
  generate_token: jest.fn(),
  generate_refresh_token: jest.fn(),
}));

describe("signin_service", () => {
  const getOneItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should sign in successfully with valid credentials", async () => {
    const email = "test@example.com";
    const password = "validpassword";

    const mockUser = {
      _id: "valid-user-id",
      email,
      password: "hashedpassword",
      status: true,
      roles: [{ name: "admin" }],
      lastLogin: null,
      save: jest.fn(),
    };

    getOneItem.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    generate_token.mockReturnValue("mocked-token");
    generate_refresh_token.mockReturnValue("mocked-refresh-token");

    const result = await signin_service(email, password, getOneItem);

    expect(getOneItem).toHaveBeenCalledWith(User, { email }, "roles");
    expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    expect(mockUser.lastLogin).toBeInstanceOf(Date);
    expect(mockUser.save).toHaveBeenCalled();
    expect(generate_token).toHaveBeenCalledWith(mockUser._id, mockUser.roles);
    expect(generate_refresh_token).toHaveBeenCalledWith(mockUser._id, mockUser.roles);
    expect(result).toEqual({
      user: mockUser,
      token: "mocked-token",
      refreshToken: "mocked-refresh-token",
      userRoles: ["admin"],
    });
  });

  it("should throw 404 error if user is not found", async () => {
    const email = "invalid@example.com";
    const password = "somepassword";

    getOneItem.mockResolvedValue(null);

    await expect(signin_service(email, password, getOneItem)).rejects.toEqual({
      code: 404,
      message: "Email invalid",
    });
  });

  it("should throw 403 error if user has not validated their email", async () => {
    const email = "test@example.com";
    const password = "somepassword";

    const mockUser = {
      _id: "valid-user-id",
      email,
      password: "hashedpassword",
      status: false,
      roles: [{ name: "user" }],
    };

    getOneItem.mockResolvedValue(mockUser);

    await expect(signin_service(email, password, getOneItem)).rejects.toEqual({
      code: 403,
      message: "Vous devez valider votre email !",
    });
  });

  it("should throw 400 error if password is invalid", async () => {
    const email = "test@example.com";
    const password = "invalidpassword";

    const mockUser = {
      _id: "valid-user-id",
      email,
      password: "hashedpassword",
      status: true,
      roles: [{ name: "user" }],
    };

    getOneItem.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await expect(signin_service(email, password, getOneItem)).rejects.toEqual({
      code: 400,
      message: "Invalid password",
    });
  });

  it("should throw a generic error if something goes wrong", async () => {
    const email = "test@example.com";
    const password = "validpassword";

    getOneItem.mockRejectedValue(new Error("Some error"));

    await expect(signin_service(email, password, getOneItem)).rejects.toEqual({
      code: 500,
      message: "Some error",
    });
  });
});