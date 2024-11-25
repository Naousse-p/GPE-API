const { professor_by_id_service } = require("./services");

exports.professor_by_id = async (req, res) => {
  try {
    const professor = await professor_by_id_service(req.userId, req);
    res.status(200).send(professor);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
