const { message_create_service } = require("./services");

exports.message_create = async (req, res) => {
  try {
    const message = await message_create_service(req.body, req.params.conversationId, req);
    res.status(201).json(message);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
