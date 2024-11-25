const { message_by_conversation_service } = require("./services");

exports.message_by_conversation = async (req, res) => {
  try {
    const messages = await message_by_conversation_service(req.params.conversationId, req.userId);
    res.status(200).json(messages);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
