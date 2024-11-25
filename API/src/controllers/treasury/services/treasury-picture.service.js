const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const TreasuryTransaction = mongoose.model("TreasuryTransaction");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.treasury_picture_service = async (transactionId, req) => {
  try {
    // Valider l'ID de la transaction
    const validTransactionId = await isIDGood(transactionId);

    // Obtenir la transaction à partir de la base de données
    const transaction = await TreasuryTransaction.findById(validTransactionId);
    if (!transaction) {
      throw { code: 404, message: "Transaction non trouvée" };
    }

    // Obtenir le chemin du fichier de reçu
    const filePath = getFilePath(transaction.receipts);

    // Lire le fichier à partir du système de fichiers
    const fileBuffer = fs.readFileSync(filePath);

    // Déterminer le type MIME du fichier
    const mimeType = getMimeType(filePath);

    // Retourner le fichier sous forme de buffer et le type MIME
    return { fileBuffer, mimeType };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function getFilePath(receiptFileName) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/receipts");
  const filePath = path.join(uploadDir, receiptFileName);

  if (fs.existsSync(filePath)) {
    return filePath;
  } else {
    throw { code: 404, message: "Fichier non trouvé" };
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}
