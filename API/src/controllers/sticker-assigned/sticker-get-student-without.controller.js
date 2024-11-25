const { sticker_get_student_without_service } = require("./services");

exports.sticker_get_student_without = async (req, res) => {
  try {
    const { stickerId, classId } = req.params;

    const stickers = await sticker_get_student_without_service(stickerId, classId, req);

    res.status(200).json(stickers);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
