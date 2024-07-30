const {
  getVersionDetails,
  insertVersionDetails,
  updateVersionDetails,
} = require("../api/versioning");

exports.getVersionDetails = async (req, res) => {
  try {
    const VersionDetails = await getVersionDetails(req.query);
    return res.status(VersionDetails.statusCode).json(VersionDetails);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.insertVersionDetails = async (req, res) => {
  try {
    const VersionDetails = await insertVersionDetails(req);
    return res.status(VersionDetails.statusCode).json(VersionDetails);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.updateVersionDetails = async (req, res) => {
  try {
    const VersionDetails = await updateVersionDetails(req);
    return res.status(VersionDetails.statusCode).json(VersionDetails);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};
