const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      required: true,
      trim: true,
    },
    gameName: {
      type: String,
      default: "",
      required: true,
      trim: true,
    },
    gameDescription: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      require: true,
      default: "",
      trim: true,
      lowercase: true,
    },
    walletAddress: {
      type: String,
      default: "",
      min: 42,
      max: 42,
    },
    apiKey: {
      type: String,
      default: "",
    },
    category: [
      {
        type: String,
        default: [],
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const userModel = mongoose.model("user", userSchema, "user");

module.exports = userModel;
