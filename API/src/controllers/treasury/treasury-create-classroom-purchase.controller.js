// treasury/controllers/treasury-create-classroom-purchase.controller.js
const { treasury_create_classroom_purchase_service } = require("./services");

exports.treasury_create_classroom_purchase = async (req, res) => {
  try {
    const { title, amount } = req.body;
    const files = req.file;
    const transaction = await treasury_create_classroom_purchase_service(req.params.classId, title, amount, files, req);
    res.status(200).json(transaction);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
