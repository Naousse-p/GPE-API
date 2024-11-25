const { appreciation_create_service } = require("./services");

exports.appreciation_create = async (req, res) => {
  try {
    const { id } = req.params;
    const appreciations = await appreciation_create_service(id, req.body, req);
    res.status(201).json(appreciations);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
