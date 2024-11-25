const { treasury_picture_service } = require("./services");

exports.treasury_picture = async (req, res) => {
  try {
    const { fileBuffer, mimeType } = await treasury_picture_service(req.params.transactionId, req);
    res.setHeader("Content-Type", mimeType);
    res.send(fileBuffer);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
