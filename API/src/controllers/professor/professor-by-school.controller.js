const { professor_by_school_service } = require("./services");

exports.professor_by_school = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const professors = await professor_by_school_service(schoolId, req);
    res.status(200).json(professors);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
