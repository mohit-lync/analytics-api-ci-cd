const express = require("express");
const route = express.Router();

const {
  insert,
  check_api_key,
  gamerInformation,
  metamaskPCTransactionsController,
  metamaskPCUsersController,
  getUserInformationController,
  getKeylessUsersController,
  getAptosFirebaseSdkUsersController,
} = require("../controller/users");
const { checkApiKey } = require("../middleware/checkApiKey");

route.post("/insert", insert);
route.post(
  "/metamask-pc-txn_log",
  checkApiKey,
  metamaskPCTransactionsController
);
route.post("/metamask-pc-login", checkApiKey, metamaskPCUsersController);
route.post("/insert_gamer_details", checkApiKey, gamerInformation);
route.post("/user_information", checkApiKey, getUserInformationController);
route.post("/keyless_user_information", checkApiKey, getKeylessUsersController);
route.post(
  "/aptos_firebase_sdk_users",
  checkApiKey,
  getAptosFirebaseSdkUsersController
);

route.post("/check_api_key", check_api_key);
module.exports = route;
