const { User } = require("../../../models");

exports.user_info_service = async (userId) => {
  try {
    const user = await User.findById(userId, "email updatedAt");
    if (!user) {
      throw { code: 404, message: "User not found" };
    }

    return {
      email: user.email,
      lastModified: user.updatedAt,
    };
  } catch (error) {
    throw { code: error.code || 500, message: error.message || "Internal server error" };
  }
};
