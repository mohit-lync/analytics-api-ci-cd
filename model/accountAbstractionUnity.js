const mongoose = require("mongoose");

const userDetails = new mongoose.Schema(
  {
    eoaAddress: {
      type: String,
      required: true,
      default: "",
    },
    smartContractAddress: {
      type: String,
      required: true,
      default: "",
    },
    chainId: {
      type: String,
      required: true,
      default: "",
    },
    isDeployed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AccountAbstractionUnitySchema = new mongoose.Schema(
  {
    apiKey: {
      required: true,
      type: String,
      default: "",
      unique: true,
    },
    users: [userDetails],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AccountAbstractionUnityModel = mongoose.model(
  "account-abstraction-unity",
  AccountAbstractionUnitySchema,
  "account-abstraction-unity"
);

module.exports = AccountAbstractionUnityModel;
