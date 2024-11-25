// config/db.js
const mongoose = require("mongoose");
const logger = require("../handler/winston.handler");
const initData = require("../utils/init-db/init-db-config");
async function connectDB() {
  try {
    const MongoUri = process.env.NODE_ENV === "test" ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;
    await mongoose.connect(MongoUri, { retryWrites: false }).then(() => {
      console.log({ level: "info", message: "Connected to MongoDB" });
    });
    await initData();
  } catch (error) {
    console.log({ level: "error", message: error.message });
  }
}

module.exports = connectDB;
