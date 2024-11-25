const mongoose = require("mongoose");

const TreasurySchoolSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    cooperativeBudget: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TreasuryTransaction",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TreasurySchool", TreasurySchoolSchema);
