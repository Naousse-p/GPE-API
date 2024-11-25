// reset-password.service.js
const { User } = require("../../../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendResetPasswordConfirmation } = require("../../../mailer/helpers/send-reset-password-confirmation");

exports.user_password_reset_service = async (token, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_TOKEN_VALIDATION_EMAIL);
  } catch (error) {
    throw { code: 400, message: "Invalid or expired token" };
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.validationToken !== token) {
    throw { code: 400, message: "Invalid token" };
  }

  try {
    if (!newPassword) {
      throw { code: 400, message: "New password is required" };
    }

    user.password = newPassword;
    user.validationToken = null;

    await sendResetPasswordConfirmation(user.email);
    await user.save();
  } catch (error) {
    console.error("Error during password hashing:", error);
    throw { code: 500, message: "Error hashing password" };
  }
};
