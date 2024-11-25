const { wallpost_get_file_service } = require("../../controllers/wallpost/services/wallpost-get-file.service.js");
const jwt = require("jsonwebtoken");

const verifyFileAccess = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    jwt.verify(token, process.env.SECRET_TOKEN_ACCESS, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid access token" });
      }

      const { postId, filename } = decoded;
      req.userId = decoded.userId;
      req.role = decoded.role; // Assurez-vous que le rôle est défini ici

      try {
        const { filePath } = await wallpost_get_file_service(postId, filename, req);
        req.filePath = filePath;
        next();
      } catch (error) {
        res.status(error.code || 500).json({ error: error.message || "Internal server error" });
      }
    });
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message || "Internal server error" });
  }
};

module.exports = verifyFileAccess;
