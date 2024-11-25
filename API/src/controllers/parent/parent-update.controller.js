const { parent_update_service } = require("./services");

exports.parent_update = async (req, res) => {
  try {
    const updatedParent = await parent_update_service(req.userId, req.body, req);
    res.status(200).json(updatedParent);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
