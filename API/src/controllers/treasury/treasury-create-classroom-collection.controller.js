const { treasury_create_classroom_collection_service } = require("./services");

exports.treasury_create_classroom_collection = async (req, res) => {
  try {
    const { title, amount } = req.body;
    const transaction = await treasury_create_classroom_collection_service(req.params.classId, title, amount, req);
    res.status(200).json(transaction);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
