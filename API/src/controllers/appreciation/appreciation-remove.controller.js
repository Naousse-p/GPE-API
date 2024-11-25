const { appreciation_remove_service } = require("./services");

exports.appreciation_remove = async (req, res) => {
  try {
    const { id } = req.params;
    const appreciations = await appreciation_remove_service(id, req);
    res.status(200).json(appreciations);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
