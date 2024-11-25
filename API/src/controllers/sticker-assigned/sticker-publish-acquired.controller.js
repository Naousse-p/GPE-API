const { sticker_publish_acquired_service } = require("./services");

exports.sticker_publish_acquired = async (req, res) => {
  try {
    const { classId } = req.params;

    const stickers = await sticker_publish_acquired_service(classId, req);

    res.status(200).json(stickers);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
