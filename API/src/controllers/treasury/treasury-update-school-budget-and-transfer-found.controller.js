const { treasury_update_school_budget_and_transfer_funds_service } = require("./services");

exports.treasury_update_school_budget_and_transfer_funds = async (req, res) => {
  try {
    const school = await treasury_update_school_budget_and_transfer_funds_service(req.params.schoolId, req.body, req);
    res.status(200).json(school);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
