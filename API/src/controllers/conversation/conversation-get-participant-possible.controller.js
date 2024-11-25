const { conversation_get_participant_possible_service } = require("./services");

exports.conversation_get_participant_possible = async (req, res) => {
  try {
    const users = await conversation_get_participant_possible_service(req.params.classId, req);
    res.status(200).json(users);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
