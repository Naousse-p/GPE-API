const { treasury_update_transaction_service } = require("./services");

const treasury_update_transaction = async (req, res) => {
  try {
    console.log("updateData", req.file);
    const { transactionId } = req.params;

    const updatedTransaction = await treasury_update_transaction_service(transactionId, req.body, req);

    res.status(200).json(updatedTransaction);
  } catch (error) {
    const statusCode = error.code && Number.isInteger(error.code) ? error.code : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
  treasury_update_transaction,
};
