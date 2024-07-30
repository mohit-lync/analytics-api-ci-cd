const express = require("express");
var cors = require("cors");

const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());

const userRoute = require("./routes/users");
const versioningRoute = require("./routes/versioning");
const accountAbstractionRoute = require("./routes/accountAbstraction");
const accountAbstractionUnityRoute = require("./routes/accountAbstractionUnity");
// const { updateUserCategories } = require("./api/updateUserCategories");
const aptosUnitySdkRoutes = require("./routes/aptos-unity-sdk");

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Api working successfully",
    statuscode: 200,
    success: true,
  });
});

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use("/user", userRoute);

app.use("/versioning", versioningRoute);
app.use("/account-abstraction-unity", accountAbstractionUnityRoute);

app.use("/account-abstraction", accountAbstractionRoute);

app.use("/aptos-unity-sdk", aptosUnitySdkRoutes);

// app.post("/update-category", updateUserCategories);

app.use("*", (req, res, next) => {
  return res.status(404).json({
    message: "Invalid Route.",
    statusCode: 404,
    success: false,
  });
});

app.listen(7410, () => {
  console.log("Server running on port 7410");
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    //listen for request
    console.log("connect to mongoose");
  })
  .catch((error) => {
    console.log(error);
  });
