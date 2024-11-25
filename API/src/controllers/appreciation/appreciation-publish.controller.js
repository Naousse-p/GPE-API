const { appreciation_publish_service } = require("./services");

exports.appreciation_publish = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { appreciationIds } = req.body;
    const userId = req.userId;

    const appreciations = await appreciation_publish_service(studentId, appreciationIds, userId);
    res.status(201).json(appreciations);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
