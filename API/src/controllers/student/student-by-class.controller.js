const { student_by_class_service } = require("./services");

exports.student_by_class = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await student_by_class_service(id, req);
    res.json(students);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
