const { User } = require("../../../models");
const { sendEmailConfirmation } = require("../../../mailer/helpers/send-email-confirmation");
const { generate_validation_token } = require("../../auth/helpers");
const { getOneItem } = require("../../../utils/db-generic-services.utils");

exports.user_resend_email_for_validate_account_service = async (email) => {
  try {
    const user = await getOneItem(User, { email: email });
    if (!user) {
      throw { code: 404, message: "User not found" };
    }

    if (user.status) {
      throw { code: 400, message: "Account already validated" };
    }

    const token = generate_validation_token(user._id);
    user.validationToken = token;
    await user.save();
    await sendEmailConfirmation(email, token);

    return { message: "Email sent" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};
