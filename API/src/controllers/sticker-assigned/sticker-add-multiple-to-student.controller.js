const { sticker_add_multiple_to_student_service } = require("./services");

exports.sticker_add_multiple_to_student = async (req, res) => {
  try {
    const { stickersIds, studentId } = req.body;
    if (!Array.isArray(stickersIds)) {
      throw { code: 400, message: "stickersIds must be an array" };
    }
    const createdAcquiredStickers = await sticker_add_multiple_to_student_service(stickersIds, studentId, req);

    res.status(200).json(createdAcquiredStickers);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
