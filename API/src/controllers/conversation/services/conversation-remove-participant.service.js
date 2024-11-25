const { Conversation } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.conversation_remove_participant_service = async (conversationId, userId) => {
  try {
    // Vérifier si l'ID de la conversation est valide
    await isIDGood(conversationId);

    // Récupérer la conversation par son ID
    const conversation = await getItemById(Conversation, conversationId, "participants");
    if (!conversation) {
      throw { code: 404, message: "Conversation not found" };
    }

    // Vérifier si l'utilisateur est un participant de la conversation
    const participantIndex = conversation.participants.findIndex((participant) => participant.user.toString() === userId);
    if (participantIndex === -1) {
      throw { code: 403, message: "You are not a participant of this conversation" };
    }

    // Empêcher le dernier participant de quitter la conversation
    if (conversation.participants.length === 1) {
      throw { code: 403, message: "You cannot leave the conversation as the last participant" };
    }

    // Vérifier si l'utilisateur est l'admin
    const isAdmin = conversation.participants[participantIndex].role === "admin";

    // Retirer l'utilisateur des participants
    conversation.participants.splice(participantIndex, 1);

    // Si l'utilisateur était l'admin, attribuer le rôle d'admin au participant suivant
    if (isAdmin && conversation.participants.length > 0) {
      conversation.participants[0].role = "admin";
    }

    // Vérifier si le nombre de participants devient inférieur ou égal à deux
    if (conversation.participants.length <= 2) {
      conversation.group = false; // La conversation devient privée
    }

    // Mettre à jour la conversation
    await updateItem(Conversation, conversationId, { participants: conversation.participants, group: conversation.group });

    return { message: "You have successfully left the conversation" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};
