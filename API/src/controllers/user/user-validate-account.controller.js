const { user_validate_account_service } = require("./services");

exports.user_validate_account = async (req, res) => {
  try {
    await user_validate_account_service(req, res);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
