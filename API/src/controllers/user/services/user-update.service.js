const { User } = require("../../../models");
const bcrypt = require("bcrypt");
const validator = require("validator");

exports.user_update_service = async (userId, data) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw { code: 404, message: "User not found" };
    }

    const { email, password, newPassword } = data;

    if (email && !validator.isEmail(email)) {
      throw { code: 400, message: "Invalid email format" };
    }

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw { code: 409, message: "Email already used" };
      }
      user.email = email;
    }

    if (password && newPassword) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw { code: 400, message: "Current password is incorrect" };
      }
      user.password = newPassword;
    }

    await user.save();
    return { message: "User updated successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message || "Internal server error" };
  }
};
