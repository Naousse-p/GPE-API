const { user_update_service } = require("./services");

exports.user_update = async (req, res) => {
  try {
    const result = await user_update_service(req.userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message || "Internal server error" });
  }
};
