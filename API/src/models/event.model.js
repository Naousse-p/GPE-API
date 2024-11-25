// src/models/Event.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const EventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ["personal", "informational", "appointment"],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    sharedWithProfessors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
    sharedWithParents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent",
      },
    ],
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
    },
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
    },
    appointmentSlots: [
      {
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          required: true,
        },
        acceptedByParents: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Parent",
          },
        ],
        acceptedByProfessors: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Professor",
          },
        ],
      },
    ],
    groupId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

EventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Event", EventSchema);
