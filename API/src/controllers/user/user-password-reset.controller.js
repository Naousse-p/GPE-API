const { user_password_reset_service } = require("./services");

exports.user_password_reset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await user_password_reset_service(token, newPassword);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
