const { parent_join_classroom_service } = require("./services");

exports.parent_join_classroom = async (req, res) => {
  try {
    const { studentCode, relationShip } = req.body;
    const result = await parent_join_classroom_service(studentCode, relationShip, req);
    res.status(result.code).json(result);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
