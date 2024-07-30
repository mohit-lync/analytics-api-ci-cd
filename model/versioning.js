const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
      default: "",
    },
    version: {
      type: String,
      required: true,
      default: "1.0.0",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const versionModel = mongoose.model("version", versionSchema, "version");
module.exports = versionModel;
