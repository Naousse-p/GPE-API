const { parent_remove_from_class_service } = require("./services");

exports.parent_remove_from_class = async (req, res) => {
  try {
    await parent_remove_from_class_service(req.params.parentId, req.params.classId, req);
    res.status(200).send();
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
