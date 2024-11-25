const { sticker_not_acquired_by_student_service } = require("./services");

exports.sticker_not_acquired_by_student = async (req, res) => {
  try {
    const { studentId } = req.params;

    const stickers = await sticker_not_acquired_by_student_service(studentId, req);

    res.status(200).json(stickers);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
