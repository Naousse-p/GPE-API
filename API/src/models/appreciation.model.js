const mongoose = require("mongoose");

const AppreciationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    section: {
      type: String,
      required: true,
      enum: ["ps", "ms", "gs"],
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appreciation", AppreciationSchema);
