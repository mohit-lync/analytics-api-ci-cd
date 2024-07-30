const mongoose = require("mongoose");

const MetamaskPCUsersSchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: false,
  }
);

const MetamaskPCUsersModel = mongoose.model(
  "Aptos-Unity-SDK-User",
  MetamaskPCUsersSchema
);

module.exports = MetamaskPCUsersModel;
