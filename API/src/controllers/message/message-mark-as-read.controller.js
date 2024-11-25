const { message_mark_as_read_service } = require("./services");

exports.message_mark_as_read = async (req, res) => {
  try {
    const message = await message_mark_as_read_service(req.params.conversationId, req.userId);
    res.status(200).json(message);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
