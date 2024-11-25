const { treasury_create_classroom_purchase_service } = require("./treasury-create-classroom-purchase.service");
const { treasury_create_classroom_collection_service } = require("./treasury-create-classroom-collection.service");
const { treasury_create_school_collection_service } = require("./treasury-create-school-collection.service");
const { treasury_create_school_purchase_service } = require("./treasury-create-school-purchase.service");
const { treasury_get_classroom_service } = require("./treasury-get-classroom.service");
const { treasury_get_school_service } = require("./treasury-get-school.service");
const { treasury_update_school_budget_and_transfer_funds_service } = require("./treasury-update-school-budget-and-transfer-found.service");
const { treasury_picture_service } = require("./treasury-picture.service");
const { treasury_update_transaction_service } = require("./treasury-update-transaction.service");

module.exports = {
  treasury_create_classroom_purchase_service,
  treasury_create_classroom_collection_service,
  treasury_create_school_collection_service,
  treasury_create_school_purchase_service,
  treasury_get_classroom_service,
  treasury_get_school_service,
  treasury_update_school_budget_and_transfer_funds_service,
  treasury_picture_service,
  treasury_update_transaction_service,
};
