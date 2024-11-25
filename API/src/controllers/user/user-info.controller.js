const { user_info_service } = require("./services");

exports.user_info = async (req, res) => {
  try {
    const result = await user_info_service(req.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message || "Internal server error" });
  }
};
