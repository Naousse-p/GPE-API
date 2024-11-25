const { sticker_remove_from_student_service } = require("./services");

exports.sticker_remove_from_student = async (req, res) => {
  try {
    const { studentId } = req.params;
    const updatedAssignedSticker = await sticker_remove_from_student_service(req.body, studentId, req);

    res.status(200).json(updatedAssignedSticker);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
