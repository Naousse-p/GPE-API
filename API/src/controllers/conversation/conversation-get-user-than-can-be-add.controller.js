const { conversation_get_user_than_can_be_add_service } = require("./services");

exports.conversation_get_user_than_can_be_add = async (req, res) => {
  try {
    const conversation = await conversation_get_user_than_can_be_add_service(req.params.id, req);
    res.status(200).json(conversation);
  } catch (error) {
    res.status(error.code).json({ message: error.message });
  }
};
