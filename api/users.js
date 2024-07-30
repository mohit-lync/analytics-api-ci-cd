const crypto = require("crypto");
const mongoose = require("mongoose");
const ethers = require("ethers");

const User = require("../model/users");
const versionModel = require("../model/versioning");
const { sendMail } = require("./sendMail");
const MetamaskPCTransactionsModel = require("../model/metamaskPCTransactions");
const MetamaskPCUsersModel = require("../model/metamaskPCUsers");
const AptosUnitySdkTransactionsModel = require("../model/Aptos-Unity-SDK-Transactions");
const AptosUnitySdkUsersModel = require("../model/Aptos-Unity-SDK-Users");
const KeylessUserSchema = require("../model/keyless-users");
const AptosFirebaseSdkUsersSchema = require("../model/aptos-firebase-sdk-users");

function generateHash() {
  return crypto
    .randomBytes(Math.ceil(32))
    .toString("hex") // convert to hexadecimal format
    .slice(0, 32)
    .toUpperCase(); // return required number of characters
}

exports.insert = async (body) => {
  try {
    let { name, gameName, gameDescription, email } = body;

    if (!name) {
      return {
        message: "Name is required",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    if (!gameName) {
      return {
        message: "Game Name is required",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    if (!email) {
      return {
        message: "Email is required",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    if (email) {
      const re = /[a-z0-9]+@[a-z]+\.[a-zA-Z]/;
      if (!re.test(email)) {
        return {
          message: "Enter a valid email address",
          success: false,
          data: [],
          statusCode: 400,
        };
      }
    }

    const checkUserEmailNotNull = await User.findOne({
      email,
      apiKey: { $ne: "" },
    });

    if (checkUserEmailNotNull) {
      return {
        message: "Email already exists.",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    const apiKey = generateHash();

    const checkUser = await User.findOne({ email, apiKey: "" });

    let create;

    if (checkUser) {
      await User.updateOne(
        {
          email,
        },
        {
          $set: {
            apiKey,
          },
        }
      );
    } else {
      create = await User.create({
        email: email.trim(),
        apiKey: apiKey.trim(),
        name: name.trim(),
        gameName: gameName.trim(),
        gameDescription: gameDescription ? gameDescription.trim() : "",
        category: [],
      });
    }

    const sendEmail = await sendMail(email.trim(), apiKey);

    return {
      message: "The API Key has been sent to your email.",
      success: true,
      data: create,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: error.message,
      success: false,
      statusCode: 500,
    };
  }
};

exports.insertGamerInformation = async (body) => {
  try {
    let { apiKey, walletAddress, productName } = body;

    if (!apiKey) {
      return {
        message: "API Key is required",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    if (!productName) {
      return {
        message: "Product name is required",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    const checkApiKey = await User.findOne({
      apiKey,
    });

    if (!checkApiKey) {
      return {
        message: "Provide Valid API Key.",
        success: false,
        statusCode: 404,
      };
    }

    if (productName) {
      const checkprod = await versionModel.find({}, { _id: 0, productName: 1 });

      const check = checkprod.filter(
        (prod) => prod.productName.toLowerCase() === productName.toLowerCase()
      );

      if (check && check.length < 1 && Array.isArray(check)) {
        return {
          message: "Product name doesn't exists.",
          success: false,
          data: [],
          statusCode: 404,
        };
      }
    }

    const checkUserUsesProduct = await User.findOne({
      apiKey,
      category: { $in: [productName.toLowerCase()] },
    });

    if (!checkUserUsesProduct) {
      await User.updateOne(
        {
          apiKey,
        },
        {
          $push: {
            category: productName.toLowerCase(),
          },
        }
      );
    }

    const gamer_details = await mongoose.connection.db
      .collection(productName.toLowerCase())
      .findOne({
        apiKey,
      });
    if (gamer_details) {
      walletAddress = [
        ...gamer_details["walletAddress"],
        ethers.getAddress(walletAddress),
      ];
    } else {
      walletAddress = [ethers.getAddress(walletAddress)];
    }

    const add_gamer_wallet_address = await mongoose.connection.db
      .collection(productName.toLowerCase())
      .findOneAndUpdate(
        {
          apiKey: apiKey,
        },
        {
          $set: { walletAddress },
        },
        {
          upsert: true,
        }
      );

    return {
      message: "Gamer information added successfully.",
      success: true,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: "Something went wrong.",
      success: false,
      statusCode: 500,
    };
  }
};

exports.metamaskPCTransactions = async (body) => {
  try {
    const { txnHash, apiKey, chainId, walletAddress, txnCost } = body;

    if (!apiKey)
      return {
        message: "API Key is required.",
        success: false,
        statusCode: 400,
      };

    if (!txnHash)
      return {
        message: "Transaction hash is required.",
        success: false,
        statusCode: 400,
      };

    if (!chainId)
      return {
        message: "Chain ID is required.",
        success: false,
        statusCode: 400,
      };

    if (!walletAddress)
      return {
        message: "Wallet address is required.",
        success: false,
        statusCode: 400,
      };

    if (txnCost === null || txnCost === undefined) {
      return {
        message: "Transaction cost is required.",
        success: false,
        statusCode: 400,
      };
    }

    const currentMonthYear = `${new Date().toLocaleString("default", {
      month: "long",
    })}${new Date().getFullYear()}`;

    const checkUserApiKey = await User.findOne({
      apiKey,
    });

    if (!checkUserApiKey) {
      return {
        message: "Provide Valid API Key.",
        success: false,
        statusCode: 404,
      };
    }

    const checkDetails = await MetamaskPCTransactionsModel.findOne({
      apiKey,
      [currentMonthYear]: {
        $exists: true,
      },
    });

    const walletAddressChainId = `${walletAddress}**${chainId}`;

    if (checkDetails) {
      if (
        checkDetails[currentMonthYear][walletAddressChainId] &&
        checkDetails[currentMonthYear][walletAddressChainId][chainId][
          txnHash
        ] === txnCost
      ) {
        return {
          message: "Transaction already exists.",
          success: false,
          statusCode: 400,
        };
      }

      const check = await MetamaskPCTransactionsModel.findOne({
        apiKey,
        [`${currentMonthYear}.${walletAddressChainId}`]: {
          $exists: true,
        },
      });

      if (check) {
        const data = await MetamaskPCTransactionsModel.findOneAndUpdate(
          {
            apiKey,
            [`${currentMonthYear}.${walletAddressChainId}`]: {
              $exists: true,
            },
          },
          {
            $set: {
              [`${currentMonthYear}.${walletAddressChainId}.${chainId}.${txnHash}`]:
                txnCost,
            },
            $inc: {
              [`${currentMonthYear}.${walletAddressChainId}.count`]: 1,
            },
          },
          {
            new: true,
          }
        );

        console.log("update data");
      } else {
        await MetamaskPCTransactionsModel.findOneAndUpdate(
          {
            apiKey,
          },
          {
            $set: {
              [`${currentMonthYear}.${walletAddressChainId}.${chainId}.${txnHash}`]:
                txnCost,
              [`${currentMonthYear}.${walletAddressChainId}.count`]: 1,
            },
          },
          {
            new: true,
          }
        );

        console.log("new chainID update data");
      }
    } else {
      const data = await MetamaskPCTransactionsModel.create({
        apiKey,
        [currentMonthYear]: {
          [`${walletAddressChainId}`]: {
            [`${chainId}`]: {
              [`${txnHash}`]: txnCost,
            },
            count: 1,
          },
        },
      });
      console.log("insert data");
    }

    return {
      message: "Transaction details added successfully.",
      success: true,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: error.message,
      success: false,
      statusCode: 500,
    };
  }
};

exports.metamaskPCUsers = async (body) => {
  try {
    const { apiKey, walletAddress, chainId } = body;

    if (!apiKey) {
      return {
        message: "API Key is required.",
        success: false,
        statusCode: 400,
      };
    }

    if (!walletAddress) {
      return {
        message: "Wallet Address is required.",
        success: false,
        statusCode: 400,
      };
    }

    if (!chainId) {
      return {
        message: "Chain ID is required.",
        success: false,
        statusCode: 400,
      };
    }

    const checkUserApiKey = await User.findOne({
      apiKey,
    });

    if (!checkUserApiKey) {
      return {
        message: "Provide Valid API Key.",
        success: false,
        statusCode: 404,
      };
    }

    const currentMonthYear = `${new Date().toLocaleString("default", {
      month: "long",
    })}${new Date().getFullYear()}`;

    const walletAddressChainId = `${walletAddress}**${chainId}`;

    const checkIfLoginActivityExists = await MetamaskPCUsersModel.findOne({
      [`${currentMonthYear}`]: {
        $exists: true,
      },
      apiKey,
    });

    if (!checkIfLoginActivityExists) {
      console.log("aaya 0");
      await MetamaskPCUsersModel.create({
        [currentMonthYear]: {
          [`${walletAddressChainId}`]: 1,
        },
        apiKey,
      });
    } else {
      console.log("aaya 2");
      await MetamaskPCUsersModel.findOneAndUpdate(
        {
          [`${currentMonthYear}`]: {
            $exists: true,
          },
          apiKey,
        },
        {
          $inc: {
            [`${currentMonthYear}.${walletAddressChainId}`]: 1,
          },
        },
        {
          new: true,
        }
      );
    }
    return {
      message: "User logged in successfully.",
      statusCode: 200,
      success: true,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: error.message,
      success: false,
      statusCode: 500,
    };
  }
};

exports.aptosUnitySdkTransactions = async (body) => {
  try {
    const { txnHash, apiKey, network, walletAddress, paymentMode } = body;

    // Here network needs to be testnet or mainnet

    const NETWORK_TYPE = ["testnet", "mainnet"];
    const PAYMENT_MODE_TYPE = ["gasless", "userpaid"];

    if (!apiKey)
      return {
        message: "API Key is required.",
        success: false,
        statusCode: 400,
      };

    if (!txnHash)
      return {
        message: "Transaction hash is required.",
        success: false,
        statusCode: 400,
      };

    if (!network)
      return {
        message: "Network is required.",
        success: false,
        statusCode: 400,
      };

    if (!walletAddress)
      return {
        message: "Wallet address is required.",
        success: false,
        statusCode: 400,
      };

    if (!paymentMode) {
      return {
        message: "Use Paymaster is required.",
        success: false,
        statusCode: 400,
      };
    }

    const NETWORK = network.toLowerCase();
    const PAYMENT_MODE = paymentMode.toLowerCase();

    if (network) {
      if (!NETWORK_TYPE.includes(NETWORK)) {
        return {
          message: "Provide valid network type.",
          success: false,
          statusCode: 400,
        };
      }
    }

    if (paymentMode) {
      if (!PAYMENT_MODE_TYPE.includes(PAYMENT_MODE)) {
        return {
          message: "Provide valid payment mode.",
          success: false,
          statusCode: 400,
        };
      }
    }

    const currentMonthYear = `${new Date().toLocaleString("default", {
      month: "long",
    })}${new Date().getFullYear()}`;

    const checkUserApiKey = await User.findOne({
      apiKey,
    });

    if (!checkUserApiKey) {
      return {
        message: "Provide Valid API Key.",
        success: false,
        statusCode: 404,
      };
    }

    const checkDetails = await AptosUnitySdkTransactionsModel.findOne({
      apiKey,
      [currentMonthYear]: {
        $exists: true,
      },
    });

    const walletAddressNetwork = `${walletAddress}**${NETWORK}`;

    if (checkDetails) {
      if (
        checkDetails[currentMonthYear][walletAddressNetwork] &&
        checkDetails[currentMonthYear][walletAddressNetwork][NETWORK][
          txnHash
        ] === PAYMENT_MODE
      ) {
        return {
          message: "Transaction already exists.",
          success: false,
          statusCode: 400,
        };
      }

      const check = await AptosUnitySdkTransactionsModel.findOne({
        apiKey,
        [`${currentMonthYear}.${walletAddressNetwork}`]: {
          $exists: true,
        },
      });

      if (check) {
        const data = await AptosUnitySdkTransactionsModel.findOneAndUpdate(
          {
            apiKey,
            [`${currentMonthYear}.${walletAddressNetwork}`]: {
              $exists: true,
            },
          },
          {
            $set: {
              [`${currentMonthYear}.${walletAddressNetwork}.${NETWORK}.${txnHash}`]:
                PAYMENT_MODE,
            },
            $inc: {
              [`${currentMonthYear}.${walletAddressNetwork}.count`]: 1,
            },
          },
          {
            new: true,
          }
        );

        console.log("update data");
      } else {
        await AptosUnitySdkTransactionsModel.findOneAndUpdate(
          {
            apiKey,
          },
          {
            $set: {
              [`${currentMonthYear}.${walletAddressNetwork}.${NETWORK}.${txnHash}`]:
                PAYMENT_MODE,
              [`${currentMonthYear}.${walletAddressNetwork}.count`]: 1,
            },
          },
          {
            new: true,
          }
        );

        console.log("new chainID update data");
      }
    } else {
      const data = await AptosUnitySdkTransactionsModel.create({
        apiKey,
        [currentMonthYear]: {
          [`${walletAddressNetwork}`]: {
            [`${NETWORK}`]: {
              [`${txnHash}`]: PAYMENT_MODE,
            },
            count: 1,
          },
        },
      });
      console.log("insert data");
    }

    return {
      message: "Transaction details added successfully.",
      success: true,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: error.message,
      success: false,
      statusCode: 500,
    };
  }
};

exports.aptosUnitySdkUsers = async (body) => {
  try {
    const { apiKey, walletAddress, network, loginMethod } = body;

    const NETWORK_TYPE = ["testnet", "mainnet"];

    if (!apiKey) {
      return {
        message: "API Key is required.",
        success: false,
        statusCode: 400,
      };
    }

    if (!walletAddress) {
      return {
        message: "Wallet Address is required.",
        success: false,
        statusCode: 400,
      };
    }

    if (!network) {
      return {
        message: "Network is required.",
        success: false,
        statusCode: 400,
      };
    }

    if (!loginMethod) {
      return {
        message: "Login Method is required.",
        success: false,
        statusCode: 400,
      };
    }

    const NETWORK = network.toLowerCase();
    const LOGIN_METHOD = loginMethod.toLowerCase();

    if (network) {
      if (!NETWORK_TYPE.includes(NETWORK)) {
        return {
          message: "Provide valid network type.",
          success: false,
          statusCode: 400,
        };
      }
    }

    const checkUserApiKey = await User.findOne({
      apiKey,
    });

    if (!checkUserApiKey) {
      return {
        message: "Provide Valid API Key.",
        success: false,
        statusCode: 404,
      };
    }

    const currentMonthYear = `${new Date().toLocaleString("default", {
      month: "long",
    })}${new Date().getFullYear()}`;

    const walletAddressNetwork = `${walletAddress}**${NETWORK}**${LOGIN_METHOD}`;

    const checkIfLoginActivityExists = await AptosUnitySdkUsersModel.findOne({
      [`${currentMonthYear}`]: {
        $exists: true,
      },
      apiKey,
    });

    if (!checkIfLoginActivityExists) {
      console.log("aaya 0");
      await AptosUnitySdkUsersModel.create({
        [currentMonthYear]: {
          [`${walletAddressNetwork}`]: 1,
        },
        apiKey,
      });
    } else {
      console.log("aaya 2");
      await AptosUnitySdkUsersModel.findOneAndUpdate(
        {
          [`${currentMonthYear}`]: {
            $exists: true,
          },
          apiKey,
        },
        {
          $inc: {
            [`${currentMonthYear}.${walletAddressNetwork}`]: 1,
          },
        },
        {
          new: true,
        }
      );
    }
    return {
      message: "User logged in successfully.",
      statusCode: 200,
      success: true,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: error.message,
      success: false,
      statusCode: 500,
    };
  }
};

exports.getUserInformation = async (body, query) => {
  try {
    const { startDate, endDate, userId } = body;

    let { limit, page } = query;

    limit = +limit || 10;
    page = +page || 0;

    let startIndex = +page * +limit;
    const endIndex = (+page + 1) * +limit;

    if (limit) {
      if (+limit <= 0)
        return {
          message: "The limit must be positive number.",
          success: false,
          statusCode: 400,
        };
      if (typeof limit !== "number")
        return {
          message: "The limit must be positive number.",
          success: false,
          statusCode: 400,
        };
    }

    let agg = [];

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          message: "Provide valid user id.",
          success: false,
          statusCode: 400,
        };
      }

      agg.push({
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      });
    }

    agg.push(
      {
        $lookup: {
          from: "metamask-sdk",
          localField: "apiKey",
          foreignField: "apiKey",
          as: "metamask-sdk",
        },
      },
      {
        $lookup: {
          from: "okxwallet-sdk",
          localField: "apiKey",
          foreignField: "apiKey",
          as: "okxwallet-sdk",
        },
      },
      {
        $lookup: {
          from: "account-abstraction-unity",
          localField: "apiKey",
          foreignField: "apiKey",
          as: "account-abstraction-unity",
        },
      },
      {
        $lookup: {
          from: "AccountAbstraction",
          localField: "_id",
          foreignField: "userId",
          as: "account-abstraction",
        },
      },
      {
        $lookup: {
          from: "AptosNpmPackageUsers",
          localField: "apiKey",
          foreignField: "apiKey",
          as: "AptosNpmPackageUsers",
        },
      },
      {
        $lookup: {
          from: "aptos-unity-sdk-users",
          localField: "apiKey",
          foreignField: "apiKey",
          as: "aptos-unity-sdk-users",
        },
      },
      {
        $lookup: {
          from: "metamask-pc-sdk-users",
          localField: "apiKey",
          foreignField: "apiKey",
          as: "metamask-pc-sdk-users",
        },
      },
      {
        $lookup: {
          from: "aptos-unity-sdk-transactions",
          localField: "apiKey",
          foreignField: "apiKey",
          as: "aptos-unity-sdk-transactions",
        },
      },
      {
        $lookup: {
          from: "login-activity-unity",
          localField: "apiKey",
          foreignField: "apiKey",
          as: "login-activity-unity",
        },
      }
    );

    const totalRecords = await User.find();

    if (startDate && endDate) {
      agg.push({
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lt: new Date(endDate),
          },
        },
      });
    }

    agg.push({
      $sort: {
        createdAt: -1,
      },
    });

    agg.push({
      $project: {
        _id: 1,
        gameName: 1,
        name: 1,
        gameDescription: 1,
        email: 1,
        metamaskSdkUsers: "$metamask-sdk",
        okxwalletSdkUsers: "$okxwallet-sdk",
        accountAbstractionUnity: "$account-abstraction-unity",
        accountAbstraction: "$account-abstraction",
        aptosNpmPackageUsers: "$AptosNpmPackageUsers",
        aptosUnitySdkUsers: "$aptos-unity-sdk-users",
        metamaskPCSdkUsers: "$metamask-pc-sdk-users",
        aptosUnitySdkTransactions: "$aptos-unity-sdk-transactions",
        loginActivityUnity: "$login-activity-unity",
      },
    });

    agg.push({
      $skip: startIndex,
    });

    agg.push({
      $limit: limit,
    });

    const data = await User.aggregate(agg);

    if (data.length === 0) {
      return {
        message: "No data found.",
        success: false,
        statusCode: 404,
      };
    }

    return {
      message: "User information found successfully.",
      success: true,
      totalRecords: totalRecords.length,
      page: +page,
      rowsPerPage: limit,
      endIndex: endIndex,
      statusCode: 200,
      data,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: error.message,
      success: false,
      statusCode: 500,
    };
  }
};

exports.getKeylessUsers = async (body, query) => {
  try {
    const NETWORK_TYPES = ["mainnet", "testnet", "devnet"];

    const { startDate, endDate, network, userId } = body;

    let { limit, page } = query;

    limit = +limit || 10;
    page = +page || 0;

    let startIndex = +page * +limit;
    const endIndex = (+page + 1) * +limit;

    if (limit) {
      if (+limit <= 0)
        return {
          message: "The limit must be positive number.",
          success: false,
          statusCode: 400,
        };
      if (typeof limit !== "number")
        return {
          message: "The limit must be positive number.",
          success: false,
          statusCode: 400,
        };
    }

    if (!network) {
      return {
        message: "Network is required.",
        success: false,
        statusCode: 400,
      };
    }

    if (network) {
      if (!NETWORK_TYPES.includes(network.toLowerCase())) {
        return {
          message: "Provide valid network type.",
          success: false,
          statusCode: 400,
        };
      }
    }

    let capitalizedNetworkString =
      network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();

    const keylessUserCollection = `Keyless-${capitalizedNetworkString}-Users`;

    const KeylessUserModel = mongoose.model(
      keylessUserCollection,
      KeylessUserSchema,
      keylessUserCollection
    );

    let agg = [];

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          message: "Provide valid user id.",
          success: false,
          statusCode: 400,
        };
      }

      agg.push({
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      });
    }

    const totalRecords = await KeylessUserModel.find();

    if (startDate && endDate) {
      agg.push({
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lt: new Date(endDate),
          },
        },
      });
    }

    agg.push({
      $sort: {
        createdAt: -1,
      },
    });

    agg.push({
      $skip: startIndex,
    });

    agg.push({
      $limit: limit,
    });

    const data = await KeylessUserModel.aggregate();

    if (data.length === 0) {
      return {
        message: "No data found.",
        success: false,
        statusCode: 404,
      };
    }

    return {
      message: "Keyless Users information found successfully.",
      success: true,
      totalRecords: totalRecords.length,
      page: +page,
      rowsPerPage: limit,
      endIndex: endIndex,
      statusCode: 200,
      data,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: error.message,
      success: false,
      statusCode: 500,
    };
  }
};

exports.getAptosFirebaseSdkUsers = async (body, query) => {
  try {
    const NETWORK_TYPES = ["mainnet", "testnet", "devnet"];

    const { network, userId } = req.body;

    let { limit, page } = query;

    limit = +limit || 10;
    page = +page || 0;

    let startIndex = +page * +limit;
    const endIndex = (+page + 1) * +limit;

    if (limit) {
      if (+limit <= 0)
        return {
          message: "The limit must be positive number.",
          success: false,
          statusCode: 400,
        };
      if (typeof limit !== "number")
        return {
          message: "The limit must be positive number.",
          success: false,
          statusCode: 400,
        };
    }

    if (!network) {
      return {
        message: "Network is required.",
        success: false,
        statusCode: 400,
      };
    }

    if (network) {
      if (!NETWORK_TYPES.includes(network.toLowerCase())) {
        return {
          message: "Provide valid network type.",
          success: false,
          statusCode: 400,
        };
      }
    }

    const capitalizedNetworkString =
      network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();

    const aptosFirebaseSdkUsersModel = mongoose.model(
      `Aptos-Firebase-${capitalizedNetworkString}-Users`,
      AptosFirebaseSdkUsersSchema,
      `Aptos-Firebase-${capitalizedNetworkString}-Users`
    );

    let agg = [];

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          message: "Provide valid user id.",
          success: false,
          statusCode: 400,
        };
      }

      agg.push({
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      });
    }

    const totalRecords = await aptosFirebaseSdkUsersModel.find();

    agg.push({
      $sort: {
        createdAt: -1,
      },
    });

    agg.push({
      $skip: startIndex,
    });

    agg.push({
      $limit: limit,
    });

    const data = await aptosFirebaseSdkUsersModel.aggregate(agg);

    if (data.length === 0) {
      return {
        message: "No data found.",
        success: false,
        statusCode: 404,
      };
    }

    return {
      message: "Aptos Firebase SDK Users information found successfully.",
      success: true,
      totalRecords: totalRecords.length,
      page: +page,
      rowsPerPage: limit,
      endIndex: endIndex,
      statusCode: 200,
      data,
    };
  } catch (error) {
    console.error("Error: -> ", error);
    return {
      message: error.message,
      success: false,
      statusCode: 500,
    };
  }
};
