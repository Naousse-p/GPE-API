const { sticker_update_service } = require("./services");

exports.sticker_update = async (req, res) => {
  try {
    const sticker = await sticker_update_service(req.params.id, req.body, req);
    res.status(200).json(sticker);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
