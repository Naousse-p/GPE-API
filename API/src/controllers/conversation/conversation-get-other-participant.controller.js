const { conversation_get_other_participant_service } = require("./services");

exports.conversation_get_other_participant = async (req, res) => {
  try {
    const conversation = await conversation_get_other_participant_service(req.params.id, req);
    res.status(200).json(conversation);
  } catch (error) {
    res.status(error.code).json({ message: error.message });
  }
};
