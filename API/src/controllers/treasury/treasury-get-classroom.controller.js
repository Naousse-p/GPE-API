const { treasury_get_classroom_service } = require("./services");

exports.treasury_get_classroom = async (req, res) => {
  try {
    const classroom = await treasury_get_classroom_service(req.params.classId, req);
    res.status(200).json(classroom);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
