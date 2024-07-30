const express = require("express");
const route = express.Router();

const {
  getVersionDetails,
  insertVersionDetails,
  updateVersionDetails,
} = require("../controller/versioning");

route.get("/get", getVersionDetails);
route.post("/insert", insertVersionDetails);
route.post("/update", updateVersionDetails);

module.exports = route;
