const { student_create_service } = require("./services/student-create.service");

exports.student_create = async (req, res) => {
  try {
    const { lastname, firstname, sexe, birthdate, level, classId } = req.body;
    const student = await student_create_service(lastname, firstname, sexe, birthdate, level, classId, req);
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
