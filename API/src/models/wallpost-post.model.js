const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const WallpostPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: false },
    text: { type: String, required: false },
    tags: { type: String, enum: ["urgent", "information", "event"], required: false },
    type: { type: String, enum: ["text", "image", "pdf", "audio", "video"], required: true },
    source: { type: [String] },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "Professor", required: true },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "Parent" }],
    allowComments: { type: Boolean, default: true },
    dateTimePublish: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

WallpostPostSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("WallpostPost", WallpostPostSchema);
