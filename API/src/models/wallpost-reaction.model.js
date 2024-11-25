const mongoose = require("mongoose");

const WallpostReactionSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "WallpostPost", required: true },
    emoji: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WallpostReaction", WallpostReactionSchema);
