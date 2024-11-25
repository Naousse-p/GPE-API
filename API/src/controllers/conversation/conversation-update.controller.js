const { conversation_update_service } = require("./services");

exports.conversation_update_controller = async (req, res) => {
  try {
    const conversation = await conversation_update_service(req.params.id, req.body, req);
    res.status(200).json(conversation);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
