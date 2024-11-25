const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const AcquiredStickerSchema = new mongoose.Schema(
  {
    sticker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sticker",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    dateAcquired: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    source: { type: String },
    comment: { type: String },
    level: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["ps", "ms", "gs"],
    },
  },
  {
    timestamps: true,
  }
);

AcquiredStickerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("AcquiredSticker", AcquiredStickerSchema);
