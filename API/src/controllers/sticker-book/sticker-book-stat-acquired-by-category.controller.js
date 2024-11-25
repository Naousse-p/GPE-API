const { sticker_book_stat_acquired_by_category_service } = require("./services");

exports.sticker_book_stat_acquired_by_category = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await sticker_book_stat_acquired_by_category_service(id, req);

    res.status(200).json(stats);
  } catch (error) {
    res.status(error.code).json({ message: error.message });
  }
};
