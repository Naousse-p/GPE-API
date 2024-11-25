const validate_student_file = (req, res, next) => {
  // Vérifier si un fichier source a été téléchargé
  if (!req.file) {
    return res.status(400).json({ error: "Source file is required" });
  }

  // Vérifier le type de fichier pour la source
  const allowedTypes = ["image/jpeg", "image/png"]; // Types de fichiers autorisés
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: "Invalid file type for source file" });
  }

  next();
};

module.exports = { validate_student_file };
