const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ChildSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    relationship: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["father", "mother", "guardian"],
    },
  },
  {
    timestamps: true,
  }
);

const ParentSchema = new mongoose.Schema(
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
    phoneNumber: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    children: [ChildSchema],
  },
  {
    timestamps: true,
  }
);

ParentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Parent", ParentSchema);
