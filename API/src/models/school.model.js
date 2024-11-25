// src/models/School
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const SchoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      lowercase: true,
    },
    postal_code: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    treasurer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
    },
    professor: [
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

SchoolSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("School", SchoolSchema);
