const { Conversation, Message } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const fs = require("fs");
const path = require("path");

exports.message_file_service = async (conversationId, messageId, userId) => {
  const conversation = await validateConversationId(conversationId);
  await validateUserInConversation(conversation, userId);

  const message = await getMessageById(messageId);

  if (!message.source) {
    throw { code: 404, message: "No file associated with this message" };
  }

  const { filePath, extension } = getMessageFilePath(message);
  const fileBuffer = fs.readFileSync(filePath);

  return { fileBuffer, extension };
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

function getMessageFilePath(message) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/message-file");
  const fileName = `${message.source}`;
  const extension = getFileType(fileName);
  const filePath = path.join(uploadDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw { code: 404, message: "File not found" };
  }

  return { filePath, extension };
}

function getFileType(filename) {
  const extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".mp3":
      return "audio/mpeg";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream"; // Fallback pour les autres types de fichiers
  }
}

async function getMessageById(messageId) {
  await isIDGood(messageId);
  const message = await getItemById(Message, messageId);
  if (!message) {
    throw { code: 404, message: "Message not found" };
  }
  return message;
}
