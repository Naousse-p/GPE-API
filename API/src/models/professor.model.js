const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ProfessorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
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
    role: [
      {
        type: String,
        required: true,
        lowercase: true,
        enum: ["professor", "director", "treasurer"],
        default: "professor",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ProfessorSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Professor", ProfessorSchema);
