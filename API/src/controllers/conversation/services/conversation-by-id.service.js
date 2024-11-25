const { Conversation } = require("../../../models/");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.conversation_by_id_service = async (conversationId, req) => {
  try {
    await isIDGood(conversationId);
    const conversation = await getItemById(Conversation, conversationId);
    if (!conversation) {
      throw { code: 404, message: "Conversation not found" };
    }

    if (!userHasPermissionForConversation(conversation, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    // Ajouter le champ isAdmin pour l'utilisateur actuel
    const currentUser = conversation.participants.find((p) => p.user.toString() === req.userId);

    return {
      ...conversation.toObject(),
      isAdmin: currentUser.role === "admin" ? true : false,
    };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function userHasPermissionForConversation(conversation, userId) {
  // Check if the user has access to the conversation
  for (const participant of conversation.participants) {
    if (participant.user.toString() === userId) {
      return true;
    }
  }
  return false;
}
