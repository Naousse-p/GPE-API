const { user_request_password_reset_service } = require("./services");

exports.user_request_password_reset = async (req, res) => {
  try {
    const { email } = req.body;
    await user_request_password_reset_service(email);
    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
