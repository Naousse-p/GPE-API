const { classroom_user_service } = require("./services");

exports.classroom_user = async (req, res) => {
  try {
    const classroom = await classroom_user_service(req);
    res.status(200).json(classroom);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
