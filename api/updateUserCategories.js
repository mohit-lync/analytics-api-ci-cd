const VersionModel = require("../model/versioning");
const UserModel = require("../model/users");
const { default: mongoose } = require("mongoose");

exports.updateUserCategories = async (req, res) => {
  try {
    const productNames = await VersionModel.find(
      {},
      { _id: 0, productName: 1 }
    );

    const getAllUsers = await UserModel.find({}, { _id: 0, apiKey: 1 });
    let prodDetails = [];

    for await (let i of productNames) {
      const getProductDetails = await mongoose.connection.db
        .collection(i.productName.toLowerCase())
        .find({})
        .toArray();
      for await (let j of getProductDetails) {
        if (j.walletAddress.length > 0) {
          const data = await UserModel.updateMany(
            {
              apiKey: j.apiKey,
            },
            {
              $set: {
                category: [],
              },
            }
          );
        }
      }

      for await (let j of getProductDetails) {
        if (j.walletAddress.length > 0) {
          const data = await UserModel.updateMany(
            {
              apiKey: j.apiKey,
            },
            {
              $push: {
                category: i.productName.toLowerCase(),
              },
            }
          );
        }
      }
    }

    return res.status(200).json({
      userDetails: await UserModel.find(),
      getAllUsers,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
