const { decrypt } = require("../helperFunctions/encrypt-decrypt-key");
const UserModel = require("../model/users");

exports.checkUserAPIKey = async (req, res, next) => {
  try {
    const currentTime = new Date();

    const apiKey = req?.headers["x-api-key"];

    if (!apiKey)
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Provide a valid API Key.",
      });

    const encryptedHash = apiKey.split("**");

    const iv = encryptedHash[1];
    const key = encryptedHash[0];

    const text = { iv, encryptedData: key };

    const decryptedKey = decrypt(text);

    const APIKEY = decryptedKey.split("$$")[0];

    const timeStamp = decryptedKey.split("$$")[1];

    const timeDifference =
      currentTime.getTime() - new Date(+timeStamp).getTime();

    const checkApiKey = await UserModel.find({ apiKey: APIKEY }, { _id: 1 });

    if (
      checkApiKey &&
      checkApiKey.length > 0 &&
      Array.isArray(checkApiKey) &&
      timeDifference <= 4000
    ) {
      return next();
    }

    return res.status(400).json({
      status: 400,
      success: false,
      message: "Provide a valid API Key.",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message,
    });
  }
};
