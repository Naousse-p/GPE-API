// controller/sticker/sticker-create.controller.js
const { sticker_create_service } = require("./services");

exports.sticker_create = async (req, res) => {
  try {
    const { name, description, category, classId } = req.body;
    const sticker = await sticker_create_service(name, description, category, classId, req);
    res.status(201).json(sticker);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
