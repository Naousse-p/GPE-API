const connectDB = require("../src/config/db.config");

before(async () => {
  try {
    await connectDB();

    console.log("Connected to the database");
  } catch (error) {
    console.error("Connected to the database, error :", error);
  }
});
