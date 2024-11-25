const { sticker_book_generate_service } = require("./services");

exports.sticker_book_generate = async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await sticker_book_generate_service(id, req, res);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=downloaded_file.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    res.status(error.code).json({ message: error.message });
  }
};
