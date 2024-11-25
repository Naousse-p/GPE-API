const { conversation_get_for_class_service } = require("./services");

exports.conversation_get_for_class = async (req, res) => {
  try {
    const conversations = await conversation_get_for_class_service(req, req.params.classId);
    res.status(200).json(conversations);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
