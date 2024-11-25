const { parent_by_school_service } = require("./services");

exports.parent_by_school = async (req, res) => {
  try {
    const parents = await parent_by_school_service(req.params.schoolId, req);
    res.status(200).json(parents);
  } catch (error) {
    res.status(error.code).json({ message: error.message });
  }
};
