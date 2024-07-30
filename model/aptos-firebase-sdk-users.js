const { Schema } = require("mongoose");

const AptosFirebaseSdkUsersSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      default: null,
      trim: true,
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
    providerId: {
      type: String,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    publicKey: {
      type: String,
      default: "",
    },
    privateKey: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.export = AptosFirebaseSdkUsersSchema;
