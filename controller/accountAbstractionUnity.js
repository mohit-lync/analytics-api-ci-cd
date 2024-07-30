const { insert, get } = require("../api/accountAbstractionUnity");

exports.insert = async (req, res) => {
  try {
    const create = await insert(req);

    return res.status(create.statuscode).json(create);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      success: false,
    });
  }
};

exports.get = async (req, res) => {
  try {
    const gt = await get(req);

    return res.status(gt.statuscode).json(gt);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      success: false,
    });
  }
};
