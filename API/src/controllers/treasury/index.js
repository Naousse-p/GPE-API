const { treasury_create_classroom_purchase } = require("./treasury-create-classroom-purchase.controller");
const { treasury_create_classroom_collection } = require("./treasury-create-classroom-collection.controller");
const { treasury_create_school_collection } = require("./treasury-create-school-collection.controller");
const { treasury_create_school_purchase } = require("./treasury-create-school-purchase.controller");
const { treasury_get_classroom } = require("./treasury-get-classroom.controller");
const { treasury_get_school } = require("./treasury-get-school.controller");
const { treasury_update_school_budget_and_transfer_funds } = require("./treasury-update-school-budget-and-transfer-found.controller");
const { treasury_picture } = require("./treasury-picture.controller");
const { treasury_update_transaction } = require("./treasury-update-transaction.controller");

module.exports = {
  treasury_create_classroom_purchase,
  treasury_create_school_collection,
  treasury_create_classroom_collection,
  treasury_create_school_purchase,
  treasury_get_classroom,
  treasury_get_school,
  treasury_update_school_budget_and_transfer_funds,
  treasury_picture,
  treasury_update_transaction,
};
