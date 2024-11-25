const { Conversation } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.conversation_get_other_participant_service = async (conversationId, req) => {
  try {
    await isIDGood(conversationId);
    const conversation = await getItemById(Conversation, conversationId);
    if (!conversation) {
      throw { code: 404, message: "Conversation not found" };
    }
    if (!userHasPermissionForConversation(conversation, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    return getOtherParticipants(conversation, req.userId);
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function userHasPermissionForConversation(conversation, userId) {
  for (const participant of conversation.participants) {
    if (participant.user.toString() === userId) {
      return true;
    }
  }
  return false;
}

function getOtherParticipants(conversation, userId) {
  const otherParticipants = [];

  for (const participant of conversation.participants) {
    if (participant.user.toString() !== userId) {
      otherParticipants.push(participant);
    }
  }
  return otherParticipants;
}
