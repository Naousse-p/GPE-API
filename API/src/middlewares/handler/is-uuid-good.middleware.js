const mongoose = require("mongoose");

const isIDGood = async (id) => {
  if (!mongoose.isValidObjectId(`${id}`)) {
    throw { code: 422, message: "ID_MALFORMED" };
  }
  return id;
};

module.exports = { isIDGood };
