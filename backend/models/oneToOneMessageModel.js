const mongoose = require("mongoose");

const oneToOneMessageSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: {
    type: [
      {
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: ["text", "image", "file", "link"],
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        text: {
          type: String,
        },
        file: {
          fileTitle: {
            type: String,
          },
          fileId: {
            type: String,
          }, 
        },
      },
    ],
    default: [],
  },
});

const OneToOneMessage = new mongoose.model(
  "OneToOneMessage",
  oneToOneMessageSchema
);
module.exports = OneToOneMessage;
