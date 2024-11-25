const { conversation_add_participant_service } = require("./services");

exports.conversation_add_participant = async (req, res) => {
  try {
    const conversation = await conversation_add_participant_service(req.params.id, req.body, req);
    res.status(200).json(conversation);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
