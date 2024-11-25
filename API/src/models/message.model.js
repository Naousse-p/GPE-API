const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const MessageSchema = new mongoose.Schema(
  {
    senderName: { type: String },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    isDeleted: { type: Boolean, default: false },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    source: {
      type: String,
    },
    filetype: {
      type: String,
    },
    previousMessages: [
      {
        message: String,
        editedAt: Date,
      },
    ],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

MessageSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Message", MessageSchema);
