const fs = require("fs");
const path = require("path");
const { Conversation, Message } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

async function validateConversationId(id) {
  return await isIDGood(id);
}

async function getConversationById(id) {
  return await getItemById(Conversation, id, "participants");
}

function validateConversationExistence(conversation) {
  if (!conversation) {
    throw { code: 404, message: "Conversation not found" };
  }
}

function isUserAdmin(conversation, userId) {
  const user = conversation.participants.find((participant) => participant.user.toString() === userId);
  return user && user.role === "admin";
}

async function deleteMessageFiles(message) {
  if (message.source) {
    const filePath = path.join(__dirname, "../../../../uploads/message-file", message.source);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      }
    });
  }
}

exports.conversation_remove_service = async (id, userId) => {
  try {
    const conversationId = await validateConversationId(id);
    const conversation = await getConversationById(conversationId);
    validateConversationExistence(conversation);

    if (!isUserAdmin(conversation, userId)) {
      throw { code: 403, message: "Only admins can remove the conversation" };
    }

    // Récupérer tous les messages de la conversation
    const messages = await Message.find({ conversation: conversationId });

    // Supprimer les fichiers associés à chaque message
    for (const message of messages) {
      await deleteMessageFiles(message);
    }

    // Supprimer tous les messages associés à la conversation
    await Message.deleteMany({ conversation: conversationId });

    // Supprimer la conversation
    await Conversation.findByIdAndDelete(conversationId);

    return { message: "Conversation and associated messages deleted successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};
