// controller/sticker/sticker-remove.controller.js
const { sticker_remove_by_id_service } = require("./services");

exports.sticker_remove_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    await sticker_remove_by_id_service(id, req);
    res.status(200).json({ message: "Sticker deleted successfully" });
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
