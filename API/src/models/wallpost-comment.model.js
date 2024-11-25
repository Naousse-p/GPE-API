const mongoose = require("mongoose");

const WallpostCommentSchema = new mongoose.Schema(
  {
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "Professor", required: false },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", required: false },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "WallpostPost", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WallpostComment", WallpostCommentSchema);
