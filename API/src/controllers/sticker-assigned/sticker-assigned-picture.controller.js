const { sticker_assigned_picture_service } = require("./services");

exports.sticker_assigned_picture = async (req, res) => {
  try {
    const { AssignedStickerId } = req.params;
    const fileBuffer = await sticker_assigned_picture_service(AssignedStickerId, req);
    res.contentType("image/jpeg").send(fileBuffer);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
