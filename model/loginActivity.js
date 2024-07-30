const mongoose = require("mongoose");

const LoginActivitySchema = new mongoose.Schema(
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

const LoginActivityModel = mongoose.model(
  "login-activity-unity",
  LoginActivitySchema,
  "login-activity-unity"
);

module.exports = LoginActivityModel;
