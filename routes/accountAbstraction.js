const express = require("express");
const route = express.Router();

const {
  insert,
  insertCallDetails,
  getCallDetails,
  updateCallDetails,
  downloadExcel,
} = require("../controller/accountAbstraction");

route.post("/insert", insert);
route.post("/insertCallDetails", insertCallDetails);
route.post("/updateCallDetails", updateCallDetails);
route.post("/get", getCallDetails);
route.get("/download", downloadExcel);

module.exports = route;
