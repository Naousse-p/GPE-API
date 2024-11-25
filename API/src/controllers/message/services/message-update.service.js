const { Message, User } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { decrypt, encrypt } = require("../helpers/encrypt-decrypt.helper.js");

exports.message_update_service = async (messageId, userId, body) => {
  // Valider l'ID du message
  await isIDGood(messageId);

  // Récupérer le message
  const message = await getItemById(Message, messageId);
  if (!message) {
    throw { code: 404, message: "Message not found" };
  }

  if (message.sender.toString() !== userId) {
    throw { code: 403, message: "You do not have permission to edit this message" };
  }

  // Récuperer l'ancien message le mettre dans le tableau previousMessages puis mettre a jour le message en ecryptant le nouveau message et en mettant a jour iv
  message.previousMessages.push({ message: message.message, editedAt: message.updatedAt });
  const encryptedMessage = encrypt(body.message);
  message.message = encryptedMessage.encryptedData;
  message.iv = encryptedMessage.iv;
  message.edited = true;
  await message.save();

  return message;
};
