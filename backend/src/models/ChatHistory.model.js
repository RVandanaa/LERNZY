const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    responseText: {
      type: String,
      required: true
    },
    language: {
      type: String,
      enum: ["en", "kn"],
      required: true
    },
    outputType: {
      type: String,
      enum: ["text", "voice", "sign-language"],
      required: true
    },
    tts: {
      provider: String,
      audioUrl: String
    },
    signLanguage: {
      animationSet: String,
      gestures: [
        {
          token: String,
          gestureId: String,
          animationUrl: String
        }
      ]
    },
    modelMeta: {
      provider: String,
      model: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
