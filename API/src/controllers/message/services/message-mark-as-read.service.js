const { Message, Conversation } = require("../../../models");
const { getItemById, updateItems } = require("../../../utils/db-generic-services.utils");

exports.message_mark_as_read_service = async (conversationId, userId) => {
  // Vérifier que la conversation existe et que l'utilisateur en fait partie
  const conversation = await getItemById(Conversation, conversationId);
  if (!conversation) {
    throw { code: 404, message: "Conversation not found" };
  }

  const participant = conversation.participants.find((participant) => participant.user.toString() === userId);
  if (!participant) {
    throw { code: 403, message: "You do not have permission to mark messages as read in this conversation" };
  }
  // Mettre à jour le champ isRead de tous les messages non lus de la conversation où l'utilisateur est le destinataire
  await updateItems(Message, { conversation: conversationId, isRead: false, sender: { $ne: userId } }, { isRead: true, $addToSet: { readBy: { userId, name: participant.name } } });

  return { message: "Messages marked as read" };
};
