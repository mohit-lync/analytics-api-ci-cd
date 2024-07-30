const { Schema } = require("mongoose");

const KeylessUserSchema = new Schema(
  {
    walletAddress: {
      type: String,
      default: "",
      unique: true,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    mintingHash: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = KeylessUserSchema;
