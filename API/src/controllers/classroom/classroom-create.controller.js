const { classroom_create_service } = require("./services");

exports.classroom_create = async (req, res) => {
  try {
    const { classData, schoolData } = req.body;
    const classroom = await classroom_create_service(classData, schoolData, req);

    res.status(201).json(classroom);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
