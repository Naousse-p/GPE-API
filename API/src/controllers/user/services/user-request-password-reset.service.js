const { User } = require("../../../models");
const { getOneItem } = require("../../../utils/db-generic-services.utils");
const { sendResetPassword } = require("../../../mailer/helpers/send-reset-password");
const { generate_reset_password_token } = require("../helpers");

exports.user_request_password_reset_service = async (email) => {
  const user = await getOneItem(User, { email });
  if (!user) {
    throw { code: 404, message: "User not found" };
  }

  const resetToken = generate_reset_password_token(user._id);
  await sendResetPassword(user.email, resetToken);

  user.validationToken = resetToken;
  await user.save();
};
