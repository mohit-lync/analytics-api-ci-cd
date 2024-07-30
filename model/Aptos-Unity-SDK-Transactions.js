const mongoose = require("mongoose");

const MetamaskPCTransactionsSchema = new mongoose.Schema(
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

const MetamaskPCTransactionsModel = mongoose.model(
  "Aptos-Unity-SDK-Transactions",
  MetamaskPCTransactionsSchema
);

module.exports = MetamaskPCTransactionsModel;
