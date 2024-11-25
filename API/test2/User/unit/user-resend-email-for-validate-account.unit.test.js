const { user_resend_email_for_validate_account_service } = require("../../../src/controllers/user/services");
const { User } = require("../../../src/models");
const { sendEmailConfirmation } = require("../../../src/mailer/helpers/send-email-confirmation");
const { generate_validation_token } = require("../../../src/controllers/auth/helpers");
const { getOneItem } = require("../../../src/utils/db-generic-services.utils");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
}));

jest.mock("../../../src/mailer/helpers/send-email-confirmation", () => ({
    sendEmailConfirmation: jest.fn(),
}));

jest.mock("../../../src/controllers/auth/helpers", () => ({
    generate_validation_token: jest.fn(),
}));

describe("user_resend_email_for_validate_account_service", () => {
    const mockEmail = "test@example.com";
    const mockToken = "mock-validation-token";

    const mockUser = {
        _id: "mock-user-id",
        email: mockEmail,
        status: false,
        save: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should resend the email confirmation successfully", async () => {
        getOneItem.mockResolvedValueOnce(mockUser);
        generate_validation_token.mockReturnValueOnce(mockToken);
        sendEmailConfirmation.mockResolvedValueOnce();

        const result = await user_resend_email_for_validate_account_service(mockEmail);

        expect(getOneItem).toHaveBeenCalledWith(User, { email: mockEmail });
        expect(generate_validation_token).toHaveBeenCalledWith(mockUser._id);
        expect(mockUser.save).toHaveBeenCalled();
        expect(sendEmailConfirmation).toHaveBeenCalledWith(mockEmail, mockToken);
        expect(result).toEqual({ message: "Email sent" });
    });

    it("should throw a 404 error if the user is not found", async () => {
        getOneItem.mockResolvedValueOnce(null);

        await expect(user_resend_email_for_validate_account_service(mockEmail)).rejects.toMatchObject({
            code: 404,
            message: "User not found",
        });
    });

    it("should throw a 400 error if the account is already validated", async () => {
        getOneItem.mockResolvedValueOnce({ ...mockUser, status: true });

        await expect(user_resend_email_for_validate_account_service(mockEmail)).rejects.toMatchObject({
            code: 400,
            message: "Account already validated",
        });
    });

    it("should throw a 500 error for unexpected errors", async () => {
        getOneItem.mockRejectedValueOnce(new Error("Unexpected error"));

        await expect(user_resend_email_for_validate_account_service(mockEmail)).rejects.toMatchObject({
            code: 500,
            message: "Unexpected error",
        });
    });
});