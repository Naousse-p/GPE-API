const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "PadletBoard", required: true },
  },
  {
    timestamps: true,
  }
);

sectionSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("PadletSection", sectionSchema);
