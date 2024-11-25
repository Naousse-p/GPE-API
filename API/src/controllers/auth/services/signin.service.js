const bcrypt = require("bcryptjs");
const { User } = require("../../../models");
const { generate_token, generate_refresh_token } = require("../helpers");

exports.signin_service = async (email, password, getOneItem) => {
  try {
    const user = await getOneItem(User, { email: email }, "roles");

    if (!user) {
      throw { code: 404, message: "Email invalid" };
    }

    if (!user.status) {
      throw { code: 403, message: "Vous devez valider votre email !" };
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw { code: 400, message: "Invalid password" };
    }

    // Mettre à jour le champ lastLogin
    user.lastLogin = new Date();
    await user.save();

    const userRoles = user.roles && Array.isArray(user.roles) ? user.roles.map((role) => role.name) : [];
    const token = generate_token(user._id, user.roles);
    const refreshToken = generate_refresh_token(user._id, user.roles);
    return { user, token, refreshToken, userRoles };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};
