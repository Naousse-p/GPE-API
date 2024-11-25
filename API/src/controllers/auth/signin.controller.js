const { signin_service } = require("./services");
const { getOneItem } = require("../../utils/db-generic-services.utils");

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, token, refreshToken, userRoles } = await signin_service(email, password, getOneItem);
    res.status(200).json({ user, token, refreshToken, userRoles });
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
