const User = require("../model/users");

exports.checkApiKey = async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(404).json({ msg: "Provide API Key.", status: 404 });
    }
    const userdata = await User.findOne({ apiKey });
    if (!userdata) {
      return res
        .status(404)
        .json({ msg: "Provide Valid API Key.", status: 404 });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ msg: error.toString(), status: 500 });
  }
};
