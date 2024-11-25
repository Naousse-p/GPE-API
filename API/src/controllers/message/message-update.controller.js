const { message_update_service } = require("./services");

exports.message_update = async (req, res) => {
  try {
    const message = await message_update_service(req.params.messageId, req.userId, req.body);
    res.status(200).json(message);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
