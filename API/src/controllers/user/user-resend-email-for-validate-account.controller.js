const { user_resend_email_for_validate_account_service } = require("./services");

exports.user_resend_email_for_validate_account = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await user_resend_email_for_validate_account_service(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
