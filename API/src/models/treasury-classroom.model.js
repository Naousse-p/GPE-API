const mongoose = require("mongoose");

const TreasuryClassroomSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    allocatedBudget: {
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

module.exports = mongoose.model("TreasuryClassroom", TreasuryClassroomSchema);
