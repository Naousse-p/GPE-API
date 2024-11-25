const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { v4: uuidv4 } = require("uuid");
const StudentSchema = new mongoose.Schema(
  {
    lastname: {
      type: String,
      required: true,
      lowercase: true,
    },
    firstname: {
      type: String,
      required: true,
      lowercase: true,
    },
    birthdate: {
      type: Date,
      required: true,
    },
    sexe: {
      type: String,
      required: true,
    },
    source: { type: String },

    code: {
      type: String,
      unique: true,
      default: function () {
        return uuidv4().split("-")[0];
      },
    },
    md5: { type: String, index: true },
    level: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["ps", "ms", "gs"],
    },
    parent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent",
      },
    ],
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  },
  {
    timestamps: true,
  }
);

StudentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Student", StudentSchema);
