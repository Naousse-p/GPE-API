const { parent_by_id_service } = require("./services");

exports.parent_by_id = async (req, res) => {
  try {
    const parent = await parent_by_id_service(req.userId, req);
    res.status(200).send(parent);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
