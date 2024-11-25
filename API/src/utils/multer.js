// utils/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage(); // Stockage en mémoire

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de taille du fichier (ici 10 Mo)
  fileFilter: function (req, file, cb) {
    // Autoriser plusieurs types de fichiers
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|mp3|mp4)$/)) {
      return cb(new Error("Seules les images, PDF, audio et vidéos sont autorisées"));
    }
    cb(null, true);
  },
});
const saveSourceFile = async (fileBuffer, id, folder, extension, addDate) => {
  try {
    // Créez le chemin de fichier où vous souhaitez enregistrer le fichier
    const uploadDir = path.join(__dirname, "../../", "uploads/", folder);
    const fileName = addDate ? `${id}_${Date.now()}_source.${extension}` : `${id}_source.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Assurez-vous que le dossier d'uploads existe, sinon créez-le
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    // Enregistrez le fichier sur le disque
    fs.writeFileSync(filePath, fileBuffer);

    // Retournez le chemin du fichier enregistré
    return fileName;
  } catch (error) {
    throw new Error("Erreur lors de l'enregistrement du fichier");
  }
};

module.exports = { upload, saveSourceFile };
