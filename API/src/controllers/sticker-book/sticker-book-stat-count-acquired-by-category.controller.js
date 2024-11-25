const { sticker_book_stat_count_acquired_by_category_service } = require("./services");

exports.sticker_book_stat_count_acquired_by_category = async (req, res) => {
  try {
    const { id } = req.params;
    const acquiredStickers = await sticker_book_stat_count_acquired_by_category_service(id, req);

    res.status(200).json(acquiredStickers);
  } catch (error) {
    res.status(error.code).json({ message: error.message });
  }
};
