const { sticker_add_to_multiple_student_service } = require("./services");

exports.sticker_add_to_multiple_student = async (req, res) => {
  try {
    const { studentIds, stickerId } = req.body;

    const createdAcquiredStickers = await sticker_add_to_multiple_student_service(studentIds, stickerId, req);

    res.status(200).json(createdAcquiredStickers);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
