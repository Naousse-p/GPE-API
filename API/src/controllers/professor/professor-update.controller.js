const { professor_update_service } = require("./services");

exports.professor_update = async (req, res) => {
  try {
    const professor = await professor_update_service(req.userId, req.body, req);
    res.status(200).json(professor);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
