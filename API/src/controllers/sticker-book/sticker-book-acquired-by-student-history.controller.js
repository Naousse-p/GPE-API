const { sticker_book_acquired_by_student_history_service } = require("./services");

exports.sticker_book_acquired_by_student_history = async (req, res) => {
  try {
    const { id } = req.params;
    const acquiredStickers = await sticker_book_acquired_by_student_history_service(id, req);

    res.status(200).json(acquiredStickers);
  } catch (error) {
    res.status(error.code).json({ message: error.message });
  }
};
