const { student_by_code_service } = require("./services");

exports.student_by_code = async (req, res) => {
  try {
    const { code } = req.params;
    const student = await student_by_code_service(code, req);
    res.status(200).json(student);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
