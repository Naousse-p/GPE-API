const { professor_remove_from_class_service } = require("./services");

exports.professor_remove_from_class = async (req, res) => {
  try {
    const { classId, professorId } = req.params;
    const updatedClass = await professor_remove_from_class_service(classId, professorId, req);
    res.status(200).json(updatedClass);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
