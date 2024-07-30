const {
  insert,
  insertGamerInformation,
  metamaskPCTransactions,
  metamaskPCUsers,
  aptosUnitySdkTransactions,
  aptosUnitySdkUsers,
  getUserInformation,
  getKeylessUsers,
  getAptosFirebaseSdkUsers,
} = require("../api/users");
const User = require("../model/users");

exports.getAptosFirebaseSdkUsersController = async (req, res) => {
  try {
    const get = await getAptosFirebaseSdkUsers(req.body);

    return res.status(get.statusCode).json(get);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.getKeylessUsersController = async (req, res) => {
  try {
    const get = await getKeylessUsers(req.body, req.query);
    return res.status(get.statusCode).json(get);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.getUserInformationController = async (req, res) => {
  try {
    const get = await getUserInformation(req.body, req.query);

    return res.status(get.statusCode).json(get);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.aptosUnitySdkUsersController = async (req, res) => {
  try {
    const insertData = await aptosUnitySdkUsers(req.body);

    return res.status(insertData.statusCode).json(insertData);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.aptosUnitySdkTransactionsController = async (req, res) => {
  try {
    const insertData = await aptosUnitySdkTransactions(req.body);

    return res.status(insertData.statusCode).json(insertData);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.metamaskPCUsersController = async (req, res) => {
  try {
    const insertData = await metamaskPCUsers(req.body);

    return res.status(insertData.statusCode).json(insertData);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.metamaskPCTransactionsController = async (req, res) => {
  try {
    const insertData = await metamaskPCTransactions(req.body);

    return res.status(insertData.statusCode).json(insertData);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.insert = async (req, res) => {
  try {
    const insertdata = await insert(req.body);
    return res.status(insertdata.statusCode).json(insertdata);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.gamerInformation = async (req, res) => {
  try {
    const userdata = await insertGamerInformation(req.body);
    if (!userdata) {
      return res.status(userdata.statusCode).json(userdata);
    }
    return res.status(200).json(userdata);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.check_api_key = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(404).json({ msg: "Please Send API Key", status: 404 });
    }
    const userdata = await User.findOne({ apiKey });
    if (!userdata) {
      return res
        .status(404)
        .json({ msg: "Please Send Valid API Key", status: 404 });
    }
    return res.status(200).json({ msg: userdata, status: 200 });
  } catch (error) {
    return res.status(500).json({ msg: error.toString(), status: 500 });
  }
};
