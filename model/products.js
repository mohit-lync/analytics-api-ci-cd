const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    walletAddress: {
      type: Array,
      default: [],
      required: true,
    },
    apiKey: {
      type: String,
      default: "",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = productSchema;
