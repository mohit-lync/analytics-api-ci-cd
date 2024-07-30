const { ChainIds } = require("../helperFunctions/chainIds");
const AccountAbstractionUnityModel = require("../model/accountAbstractionUnity");
const LoginActivityModel = require("../model/loginActivity");
const UserModel = require("../model/users");

exports.insert = async (req) => {
  try {
    const { apiKey, eoaAddress, smartContractAddress, chainId, isDeployed } =
      req.body;

    if (!apiKey) {
      return {
        message: "API Key is required.",
        statuscode: 400,
        success: false,
      };
    }

    if (!eoaAddress) {
      return {
        message: "EOA Address is required.",
        statuscode: 400,
        success: false,
      };
    }
    if (!smartContractAddress) {
      return {
        message: "Smart Contract Address is required.",
        statuscode: 400,
        success: false,
      };
    }
    if (!chainId) {
      return {
        message: "Chain Id is required.",
        statuscode: 400,
        success: false,
      };
    }

    if (eoaAddress == smartContractAddress) {
      return {
        message: "Provide valid arguments.",
        statuscode: 400,
        success: false,
      };
    }

    if (chainId) {
      console.log(
        "chainId validation...-->",
        ChainIds.includes(+chainId),
        chainId.substring(0, 2) === "0x",
        chainId
      );

      if (!ChainIds.includes(+chainId) || chainId.substring(0, 2) === "0x") {
        return {
          message: "Provide a valid chain id.",
          statuscode: 400,
          success: false,
        };
      }
    }

    const checkUser = await UserModel.findOne({ apiKey });

    if (!checkUser)
      return {
        message: "Provide a valid api key",
        statuscode: 400,
        success: false,
      };

    const validateUser = await AccountAbstractionUnityModel.findOne({
      apiKey,
    });

    const users = {
      eoaAddress,
      smartContractAddress,
      chainId,
      isDeployed,
    };

    const currentMonthYear = `${new Date().toLocaleString("default", {
      month: "long",
    })}${new Date().getFullYear()}`;

    const eoaAddressChainId = `${eoaAddress}**${chainId}`;

    console.log({
      currentMonthYear,
      eoaAddressChainId,
      [currentMonthYear]: {
        [`${eoaAddressChainId}`]: 1,
      },
      apiKey,
    });

    if (validateUser) {
      let agg = [];

      agg.push({
        $unwind: {
          path: "$users",
        },
      });

      agg.push({
        $project: {
          _id: 1,
          apiKey: 1,
          "users.smartContractAddress": {
            $toLower: "$users.smartContractAddress",
          },
          "users.eoaAddress": {
            $toLower: "$users.eoaAddress",
          },
          "users.chainId": 1,
          "users.isDeployed": 1,
        },
      });

      agg.push({
        $match: {
          apiKey,
          "users.eoaAddress": eoaAddress.toLowerCase(),
          "users.smartContractAddress": smartContractAddress.toLowerCase(),
          "users.chainId": chainId,
        },
      });

      const fetchUser = await AccountAbstractionUnityModel.aggregate(agg);

      console.log("fetchUser", fetchUser.length);

      if (fetchUser && fetchUser.length > 0 && Array.isArray(fetchUser)) {
        console.log("aaya 6");
        const checkIfLoginActivityExists = await LoginActivityModel.findOne({
          [`${currentMonthYear}`]: {
            $exists: true,
          },
          apiKey,
        });

        console.log(
          "checkIfLoginActivityExists[currentMonthYear][eoaAddressChainId]",
          checkIfLoginActivityExists
        );

        if (!checkIfLoginActivityExists) {
          console.log("aaya 0", {
            [currentMonthYear]: {
              [`${eoaAddressChainId}`]: 1,
            },
            apiKey,
          });
          await LoginActivityModel.create({
            [currentMonthYear]: {
              [`${eoaAddressChainId}`]: 1,
            },
            apiKey,
          });
        } else {
          console.log("aaya 2");
          await LoginActivityModel.findOneAndUpdate(
            {
              [`${currentMonthYear}`]: {
                $exists: true,
              },
              apiKey,
            },
            {
              $inc: {
                [`${currentMonthYear}.${eoaAddressChainId}`]: 1,
              },
            },
            {
              new: true,
            }
          );
        }
        return {
          message: "User logged in successfully.",
          statuscode: 200,
          success: true,
        };
      }

      const validateUserEOAAddress = await AccountAbstractionUnityModel.find({
        "users.eoaAddress": eoaAddress,
        "users.chainId": chainId,
        apiKey,
      });

      if (
        validateUserEOAAddress &&
        validateUserEOAAddress.length > 0 &&
        Array.isArray(validateUserEOAAddress)
      )
        return {
          message: "EOA Address needs to be unique.",
          statuscode: 400,
          success: false,
        };

      const validateUserSmartContractAddress =
        await AccountAbstractionUnityModel.find({
          "users.smartContractAddress": smartContractAddress,
          "users.chainId": chainId,
          apiKey,
        });

      if (
        validateUserSmartContractAddress &&
        validateUserSmartContractAddress.length > 0 &&
        Array.isArray(validateUserSmartContractAddress)
      )
        return {
          message: "Smart Contract Address needs to be unique.",
          statuscode: 400,
          success: false,
        };

      await AccountAbstractionUnityModel.findOneAndUpdate(
        {
          apiKey,
        },
        {
          $push: {
            users,
          },
        },
        {
          new: true,
        }
      );

      const checkIfLoginActivityExists = await LoginActivityModel.findOne({
        [`${currentMonthYear}`]: {
          $exists: true,
        },
        apiKey,
      });

      console.log("checkIfLoginActivityExists", checkIfLoginActivityExists);

      if (!checkIfLoginActivityExists) {
        console.log("aaya 3", {
          [currentMonthYear]: {
            [`${eoaAddressChainId}`]: 1,
          },
          apiKey,
        });
        const d = await LoginActivityModel.create({
          [currentMonthYear]: {
            [`${eoaAddressChainId}`]: 1,
          },
          apiKey,
        });

        console.log("d", d);
      } else {
        console.log("aaya 4");
        await LoginActivityModel.updateOne(
          {
            [`${currentMonthYear}`]: {
              $exists: true,
            },
            apiKey,
          },
          {
            $set: {
              [`${currentMonthYear}.${eoaAddressChainId}`]: 1,
            },
          }
        );
      }
    } else {
      console.log("aaya 5");
      await AccountAbstractionUnityModel.create({
        apiKey,
        users,
      });

      await LoginActivityModel.create({
        [currentMonthYear]: {
          [`${eoaAddressChainId}`]: 1,
        },
        apiKey,
      });
    }

    return {
      message: "Record inserted successfully.",
      statuscode: 200,
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Something went wrong.",
      statuscode: 500,
      success: false,
    };
  }
};

exports.get = async (req) => {
  try {
    const { apiKey, chainId } = req.body;

    if (!apiKey) {
      return {
        message: "API Key is required.",
        statuscode: 400,
        success: false,
      };
    }

    const checkUser = await UserModel.findOne({ apiKey });

    if (!checkUser)
      return {
        message: "Provide a valid api key",
        statuscode: 400,
        success: false,
      };

    let agg = [];

    agg.push({
      $match: {
        apiKey,
      },
    });

    agg.push({
      $unwind: {
        path: "$users",
      },
    });

    agg.push({
      $project: {
        _id: "$_id",
        eoaAddress: "$users.eoaAddress",
        smartContractAddress: "$users.smartContractAddress",
        chainId: "$users.chainId",
        isDeployed: "$users.isDeployed",
        userCreatedAt: "$users.createdAt",
        userUpdatedAt: "$users.updatedAt",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
      },
    });

    if (chainId) {
      console.log(
        "chainId validation...-->",
        ChainIds.includes(+chainId),
        chainId.substring(0, 2) === "0x",
        chainId
      );

      if (!ChainIds.includes(+chainId) || chainId.substring(0, 2) === "0x") {
        return {
          message: "Provide a valid chain id.",
          statuscode: 400,
          success: false,
        };
      }

      agg.push({
        $match: {
          chainId,
        },
      });
    }

    const getData = await AccountAbstractionUnityModel.aggregate(agg);

    if (getData && getData.length > 0 && Array.isArray(getData)) {
      return {
        success: true,
        statuscode: 200,
        message: "All records found.",
        data: getData,
      };
    }

    return {
      success: false,
      statuscode: 404,
      message: "No records found.",
    };
  } catch (error) {
    return {
      success: false,
      statuscode: 500,
      message: "Something went wrong.",
    };
  }
};
