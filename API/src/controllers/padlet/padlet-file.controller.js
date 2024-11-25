const { padlet_file_service } = require("./services");
const jwt = require("jsonwebtoken");

exports.padlet_file = async (req, res) => {
  try {
    console.log("Padlet file controller");
    const { id } = req.params;
    const { filePath, extension } = await padlet_file_service(id, req);

    // Générer un token temporaire pour l'accès au fichier
    const token = jwt.sign({ id, userId: req.userId, role: req.role }, process.env.SECRET_TOKEN_ACCESS, { expiresIn: "1h" });
    const fileUrl = `${req.protocol}://${req.get("host")}/api/padlet/uploads/${id}${extension}?token=${token}`;

    res.json({ fileUrl, extension });
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
