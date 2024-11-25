const { conversation_create_service } = require("./services");

exports.conversation_create = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await conversation_create_service(req.body, id, req);
    res.status(201).json(conversation);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
