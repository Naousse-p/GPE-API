const { Message, Conversation } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../utils/db-generic-services.utils");

exports.message_remove_service = async (messageId, userId) => {
  const message = await validateMessageId(messageId);
  await validateUserInConversation(message.conversation, userId);

  message.isDeleted = true;
  await message.save();

  return { message: "Message marked as deleted" };
};

async function validateMessageId(messageId) {
  await isIDGood(messageId);
  const message = await getItemById(Message, messageId);
  if (!message) {
    throw { code: 404, message: "Message not found" };
  }
  return message;
}

async function validateUserInConversation(conversationId, userId) {
  const conversation = await getItemById(Conversation, conversationId);
  const isParticipant = conversation.participants.some((participant) => participant.user.toString() === userId);
  if (!isParticipant) {
    throw { code: 403, message: "You are not a participant in this conversation" };
  }
}
