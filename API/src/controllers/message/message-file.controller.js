const { message_file_service } = require("./services");

exports.message_file = async (req, res) => {
  try {
    const { fileBuffer, extension } = await message_file_service(req.params.conversationId, req.params.messageId, req.userId);
    res.contentType(extension).send(fileBuffer);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
