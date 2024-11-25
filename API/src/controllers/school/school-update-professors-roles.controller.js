const { school_update_professors_roles_service } = require("./services");

exports.school_update_professors_roles = async (req, res) => {
  try {
    const { schoolId, professors } = req.body;
    const response = await school_update_professors_roles_service(schoolId, professors, req);
    res.status(response.code).json({ success: response.message });
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
};
