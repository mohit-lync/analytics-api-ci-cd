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
  "Metamask-PC-SDK-User",
  MetamaskPCUsersSchema
);

module.exports = MetamaskPCUsersModel;
