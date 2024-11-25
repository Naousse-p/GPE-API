const { wallpost_get_file_service } = require("./services");
const jwt = require("jsonwebtoken");

exports.wallpost_get_file = async (req, res) => {
  try {
    const { postId, filename } = req.params;
    const { filePath, extension } = await wallpost_get_file_service(postId, filename, req);

    // Générer un token temporaire pour l'accès au fichier
    const token = jwt.sign({ postId, filename, userId: req.userId, role: req.role }, process.env.SECRET_TOKEN_ACCESS, { expiresIn: "1h" });
    const fileUrl = `${req.protocol}://${req.get("host")}/api/uploads/wallpost-posts/${filename}?token=${token}`;

    res.json({ fileUrl, extension });
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
