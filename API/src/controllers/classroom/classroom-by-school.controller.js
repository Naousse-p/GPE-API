const { classroom_by_school_service } = require("./services");

exports.classroom_by_school = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const classrooms = await classroom_by_school_service(schoolId, req);
    res.status(200).json(classrooms);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
