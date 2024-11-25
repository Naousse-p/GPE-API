const { Message, Conversation } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { decrypt } = require("../helpers/encrypt-decrypt.helper.js");

exports.message_by_conversation_service = async (conversationId, userId) => {
  try {
    const conversation = await validateConversationId(conversationId);
    await validateUserInConversation(conversation, userId);

    const messages = await getItems(Message, { conversation: conversationId }, { createdAt: 1, path: "readBy" });

    // Déchiffrer les messages et ajouter la propriété isSender
    const decryptedMessages = messages.map((msg) => {
      const decryptedMessage = decrypt({ iv: msg.iv, encryptedData: msg.message });
      return {
        ...msg.toObject(),
        message: decryptedMessage,
        isSender: msg.sender.toString() === userId,
      };
    });

    return decryptedMessages;
  } catch (error) {
    // Gérer les erreurs et renvoyer un code de statut HTTP valide
    if (error.code && error.message) {
      throw { code: error.code, message: error.message };
    } else {
      throw { code: 500, message: "Internal Server Error" };
    }
  }
};

async function validateConversationId(conversationId) {
  await isIDGood(conversationId);
  const conversation = await getItemById(Conversation, conversationId);
  if (!conversation) {
    throw { code: 404, message: "Conversation not found" };
  }
  return conversation;
}

async function validateUserInConversation(conversation, userId) {
  const isParticipant = conversation.participants.some((participant) => participant.user.toString() === userId);
  if (!isParticipant) {
    throw { code: 403, message: "You are not a participant in this conversation" };
  }
}
