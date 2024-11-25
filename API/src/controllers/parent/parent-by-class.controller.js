const { parent_by_class_service } = require("./services");

exports.parent_by_class = async (req, res) => {
  try {
    const parents = await parent_by_class_service(req.params.classId, req);
    res.status(200).json(parents);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
