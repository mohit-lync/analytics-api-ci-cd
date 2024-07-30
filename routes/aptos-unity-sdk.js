const express = require("express");
const route = express.Router();

const {
  aptosUnitySdkTransactionsController,
  aptosUnitySdkUsersController,
} = require("../controller/users");

const { checkApiKey } = require("../middleware/checkApiKey");

route.post("/user-login", checkApiKey, aptosUnitySdkUsersController);

route.post(
  "/user-transactions",
  checkApiKey,
  aptosUnitySdkTransactionsController
);

module.exports = route;
