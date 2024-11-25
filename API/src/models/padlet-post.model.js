const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const postSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    type: { type: String, enum: ["text", "image", "pdf", "audio", "video", "youtube", "link"], required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    content: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "Professor", required: true },
    source: { type: String },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "PadletBoard", required: true },
    url: { type: String },
  },
  {
    timestamps: true,
  }
);

postSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("PadletPost", postSchema);
