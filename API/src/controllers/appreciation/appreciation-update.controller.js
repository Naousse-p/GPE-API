const { appreciation_update_service } = require("./services");

exports.appreciation_update = async (req, res) => {
  try {
    const { studentId, appreciationId } = req.params;
    const appreciations = await appreciation_update_service(studentId, appreciationId, req.body, req);
    res.status(200).json(appreciations);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
