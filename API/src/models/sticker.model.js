const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const StickerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    source: { type: String },
    md5: { type: String, index: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Devenir élève",
        "Mobiliser le langage dans toutes ses dimensions",
        "Agir, s’exprimer, comprendre à travers les activités artistiques",
        "Agir, s’exprimer, comprendre à travers l’activité physique",
        "Construire les premiers outils pour structurer sa pensée",
        "Explorer le monde",
      ],
    },
    class: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  },
  {
    timestamps: true,
  }
);

StickerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Sticker", StickerSchema);
