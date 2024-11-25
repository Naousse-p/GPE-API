const { user_validate_account_service } = require("../../../src/controllers/user/services");
const { User } = require("../../../src/models");

jest.mock("../../../src/models", () => ({
    User: {
        findOneAndUpdate: jest.fn(),
    },
}));

describe("user_validate_account_service", () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {
                token: "valid-token",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.clearAllMocks();
    });

    it("should validate the account successfully", async () => {
        const mockUser = {
            _id: "user-id",
            validationToken: "valid-token",
            save: jest.fn(),
        };

        User.findOneAndUpdate.mockResolvedValueOnce(mockUser);

        await user_validate_account_service(req, res);

        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { validationToken: "valid-token" },
            { status: true },
            { new: true }
        );
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Account validated successfully" });
    });

    it("should return 404 if validation token is invalid", async () => {
        User.findOneAndUpdate.mockResolvedValueOnce(null);

        await user_validate_account_service(req, res);

        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { validationToken: "valid-token" },
            { status: true },
            { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid validation token" });
    });

    it("should return 500 on internal server error", async () => {
        User.findOneAndUpdate.mockRejectedValueOnce(new Error("Internal error"));

        await user_validate_account_service(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
});