const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    visibleToParents: { type: Boolean, default: false },
    sharedWithClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  },
  {
    timestamps: true,
  }
);

boardSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("PadletBoard", boardSchema);
