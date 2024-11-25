const { message_remove_service } = require("./services");

exports.message_remove = async (req, res) => {
  try {
    const message = await message_remove_service(req.params.messageId, req.userId);
    res.status(200).json(message);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
