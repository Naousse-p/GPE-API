// src/models/Class.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    level: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["ps", "ms", "gs", "ps/ms", "ms/gs", "ps/gs"],
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },
    professor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
    visitors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
  },
  {
    timestamps: true,
  }
);

ClassSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Class", ClassSchema);
