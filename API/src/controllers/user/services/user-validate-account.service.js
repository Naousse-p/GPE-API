const { User } = require("../../../models");

exports.user_validate_account_service = async (req, res) => {
  try {
    const { token } = req.query;
    // Vérifier le token dans la base de données
    const user = await User.findOneAndUpdate({ validationToken: token }, { status: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "Invalid validation token" });
    }
    user.validationToken = undefined;
    await user.save();
    return res.status(200).json({ message: "Account validated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
