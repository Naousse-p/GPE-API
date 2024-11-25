const { sticker_by_id_service } = require("./services");

exports.sticker_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const sticker = await sticker_by_id_service(id, req);
    res.status(200).json(sticker);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
