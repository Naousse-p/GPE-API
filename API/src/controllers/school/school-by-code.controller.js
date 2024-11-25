const { school_by_code_service } = require("./services");

exports.school_by_code = async (req, res) => {
  try {
    const { code } = req.params;
    const school = await school_by_code_service(code);
    res.status(200).json(school);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
