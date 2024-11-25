const mongoose = require("mongoose");

const TreasuryTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["collection", "purchase"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reimbursed"],
      default: "pending",
    },
    receipts: {
      type: String,
    },

    classTreasury: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassTreasury",
    },
    schoolTreasury: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolTreasury",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TreasuryTransaction", TreasuryTransactionSchema);
