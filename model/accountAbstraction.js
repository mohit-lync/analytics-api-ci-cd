const mongoose = require("mongoose");

const DemoCallDetails = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: undefined,
  },
  email: {
    type: String,
    required: false,
    default: undefined,
  },
  didUserAttendedCall: {
    type: Boolean,
    required: false,
    default: false,
  },
  isCallbooked: {
    type: Boolean,
    required: false,
    default: false,
  },
  status: {
    type: String,
    required: false,
    default: undefined,
  },
  inviteeURL: {
    type: String,
    required: false,
    default: undefined,
  },
  rescheduleUrl: {
    type: String,
    required: false,
    default: undefined,
  },
  cancelUrl: {
    type: String,
    required: false,
    default: undefined,
  },
  startDate: {
    type: Date,
    required: false,
    default: undefined,
  },
  endDate: {
    type: Date,
    required: false,
    default: undefined,
  },
  timesCallBooked: {
    type: Number,
    default: 1,
  },
});

const AccountAbstractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      default: undefined,
    },
    platform: {
      type: String,
      required: true,
      default: "",
    },
    chainId: {
      type: String,
      required: true,
      default: "",
    },
    message: {
      type: String,
      default: undefined,
    },
    isApiKeyGenerated: {
      type: Boolean,
      required: true,
      default: false,
    },
    isSDKDocsShared: {
      type: Boolean,
      required: true,
      default: false,
    },
    demoCallDetails: DemoCallDetails,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AccountAbstractionModel = mongoose.model(
  "AccountAbstraction",
  AccountAbstractionSchema,
  "AccountAbstraction"
);
module.exports = AccountAbstractionModel;
