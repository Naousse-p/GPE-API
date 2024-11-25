const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ParticipantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["admin", "participant"],
      default: "participant",
    },
    name: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ConversationSchema = new mongoose.Schema(
  {
    participants: [ParticipantSchema],
    group: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Conversation", ConversationSchema);
