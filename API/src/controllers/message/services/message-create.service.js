const { Conversation, Message, User } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { saveSourceFile } = require("../../../utils/multer");
const { encrypt } = require("../helpers/encrypt-decrypt.helper.js");

exports.message_create_service = async (body, conversation_id, req) => {
  const conversation = await validateConversationId(conversation_id);
  await validateUserInConversation(conversation, req.userId);

  const encryptedMessage = encrypt(body.content);
  const participant = conversation.participants.find((participant) => participant.user.toString() === req.userId);

  const messageData = {
    sender: req.userId,
    message: encryptedMessage.encryptedData,
    iv: encryptedMessage.iv,
    conversation: conversation_id,
    senderName: participant.name,
  };

  const message = new Message(messageData);
  await message.save();

  if (req.file) {
    const fileExtension = req.file.mimetype.split("/")[1];
    const filePath = await saveSourceFile(req.file.buffer, message._id, "message-file", fileExtension, false);
    message.source = filePath;
    message.filetype = fileExtension;
    await message.save();
  }

  // mettre a jour la date de la conversation updateAt
  conversation.updatedAt = new Date();

  return message;
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
