const { treasury_get_school_service } = require("./services");

exports.treasury_get_school = async (req, res) => {
  try {
    const school = await treasury_get_school_service(req.params.schoolId, req);
    res.status(200).json(school);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
