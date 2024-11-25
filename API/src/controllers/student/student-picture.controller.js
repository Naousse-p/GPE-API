const { student_picture_service } = require("./services");

exports.student_picture = async (req, res) => {
  try {
    const { id } = req.params;
    const fileBuffer = await student_picture_service(id, req);
    res.contentType("image/jpeg").send(fileBuffer);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
