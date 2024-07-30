const crypto = require("crypto");
const { default: mongoose } = require("mongoose");
const { default: axios } = require("axios");
const ethers = require("ethers");

const User = require("../model/users");
const AccountAbstractionModel = require("../model/accountAbstraction");
const { sendApiKeyAndSdkDocs } = require("./sendMail");

function generateHash() {
  return crypto
    .randomBytes(Math.ceil(32))
    .toString("hex") // convert to hexadecimal format
    .slice(0, 32)
    .toUpperCase(); // return required number of characters
}

exports.insert = async (req) => {
  try {
    let { name, gameName, gameDescription, email, chainId, message, platform } =
      req.body;

    const getAddress = ethers.getAddress;

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

    if (!gameDescription) {
      return {
        message: "Game Description is required",
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
          message: "Please enter a valid email address",
          success: false,
          data: [],
          statusCode: 400,
        };
      }
    }

    if (!chainId) {
      return {
        message: "Chain Id is required.",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    if (!platform) {
      return {
        message: "Platform is required.",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    const checkUserDetails = await User.findOne({
      email,
      category: { $nin: ["demo-book"] },
    });

    if (checkUserDetails) {
      const update = await User.updateOne(
        {
          _id: checkUserDetails._id,
        },
        {
          $push: {
            category: "demo-book",
          },
        }
      );

      await AccountAbstractionModel.create({
        // insert details in account abstraction collection.
        chainId,
        message: message ? message.trim() : undefined,
        platform,
        userId: checkUserDetails._id,
        isApiKeyGenerated: false,
        isSDKDocsShared: false,
        demoCallDetails: {
          email: email.trim(),
          name: name.trim(),
        },
      });
    } else {
      const checkUserDetailsForDemoBook = await User.findOne({
        email,
        category: { $in: ["demo-book"] },
      });

      if (checkUserDetailsForDemoBook) {
        const checkAA = await AccountAbstractionModel.findOne({
          "demoCallDetails.email": email,
          userId: checkUserDetailsForDemoBook._id,
        });
        if (checkAA) {
          await AccountAbstractionModel.updateOne(
            {
              "demoCallDetails.email": email,
              userId: checkUserDetailsForDemoBook._id,
            },
            {
              $inc: {
                "demoCallDetails.timesCallBooked": 1,
              },
            }
          );
        } else {
          await AccountAbstractionModel.create({
            chainId,
            message: message ? message.trim() : undefined,
            platform,
            userId: checkUserDetailsForDemoBook._id,
            isApiKeyGenerated: false,
            isSDKDocsShared: false,
            demoCallDetails: {
              email: email.trim(),
              name: name.trim(),
            },
          });
        }
      } else {
        const create = await User.create({
          email: email.trim(),
          name: name.trim(),
          gameName: gameName.trim(),
          gameDescription: gameDescription.trim(),
          category: ["demo-book"],
        });

        // insert details in account abstraction collection.

        await AccountAbstractionModel.create({
          chainId,
          message: message ? message.trim() : undefined,
          platform,
          userId: create._id,
          isApiKeyGenerated: false,
          isSDKDocsShared: false,
          demoCallDetails: {
            email: email.trim(),
            name: name.trim(),
          },
        });
      }
    }
    return {
      message: "Please schedule your demo now!",
      success: true,
      statusCode: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Something went wrong.",
      success: false,
    };
  }
};

exports.insertCallDetails = async (req) => {
  try {
    const {
      payload: {
        cancel_url,
        email,
        event,
        status,
        uri,
        reschedule_url,
        scheduled_event: { start_time, end_time },
      },
    } = req.body;

    console.log(JSON.stringify(req.body));

    await AccountAbstractionModel.updateOne(
      {
        "demoCallDetails.email": email,
      },
      {
        $set: {
          "demoCallDetails.status": status,
          "demoCallDetails.event": event,
          "demoCallDetails.inviteeURL": uri,
          "demoCallDetails.startDate": start_time,
          "demoCallDetails.isCallbooked": true,
          "demoCallDetails.didUserAttendedCall": false,
          "demoCallDetails.endDate": end_time,
          "demoCallDetails.rescheduleUrl": reschedule_url,
          "demoCallDetails.cancelUrl": cancel_url,
        },
      }
    );

    return {
      message: "Demo call data inserted successfully",
      statusCode: 201,
      success: true,
    };
  } catch (error) {
    return {
      message: "Something went wrong.",
      statusCode: 500,
      success: false,
    };
  }
};

exports.getCallDetails = async (req) => {
  try {
    const { userId } = req.query;

    let agg = [];
    agg.push({
      $lookup: {
        from: "AccountAbstraction",
        localField: "_id",
        foreignField: "userId",
        as: "result",
      },
    });

    agg.push({
      $unwind: {
        path: "$result",
      },
    });

    agg.push({
      $project: {
        _id: "$_id",
        name: "$name",
        email: "$email",
        gameName: "$gameName",
        gameDescription: "$gameDescription",
        walletAddress: "$walletAddress",
        category: "$category",
        platform: "$result.platform",
        chainId: "$result.chainId",
        message: "$result.message",
        isApiKeyGenerated: "$result.isApiKeyGenerated",
        isSDKDocsShared: "$result.isSDKDocsShared",
        inviteeURL: "$result.demoCallDetails.inviteeURL",
        rescheduleUrl: "$result.demoCallDetails.rescheduleUrl",
        isCallbooked: "$result.demoCallDetails.isCallbooked",
        didUserAttendedCall: "$result.demoCallDetails.didUserAttendedCall",
        rescheduleUrl: "$result.demoCallDetails.rescheduleUrl",
        cancelUrl: "$result.demoCallDetails.cancelUrl",
        callStartDate: "$result.demoCallDetails.startDate",
        callEndDate: "$result.demoCallDetails.endDate",
        callStatus: "$result.demoCallDetails.status",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
      },
    });

    if (userId)
      agg.push({
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      });

    const get = await User.aggregate(agg);

    if (get && get.length > 0 && Array.isArray(get)) {
      return {
        message: "Call details.",
        statusCode: 200,
        success: true,
        data: get,
      };
    }
    return {
      message: "No records.",
      statusCode: 404,
      success: false,
    };
  } catch (error) {
    return {
      message: "Something went wrong.",
      statusCode: 500,
      success: false,
    };
  }
};

exports.updateCallDetails = async (req) => {
  try {
    const { email, didUserAttendedCall, message } = req.body;

    if (!email) {
      return {
        message: "Email is required.",
        success: false,
        statusCode: 400,
      };
    }

    if (!didUserAttendedCall) {
      return {
        message: "didUserAttendedCall is required.",
        success: false,
        statusCode: 400,
      };
    }

    const getData = await User.findOne({ email });

    if (getData) {
      const getAccountAbstractionDetails =
        await AccountAbstractionModel.findOne({ userId: getData._id });
      if (
        getAccountAbstractionDetails.isSDKDocsShared &&
        getAccountAbstractionDetails.isApiKeyGenerated
      ) {
        return {
          message: "Docs shared already to this user.",
          statusCode: 400,
          success: false,
        };
      }

      if (
        !getAccountAbstractionDetails.isSDKDocsShared &&
        didUserAttendedCall === true
      ) {
        // await sendApiKeyAndSdkDocs(
        //   email,
        //   getData.apiKey,
        //   getAccountAbstractionDetails.platform
        // );

        await AccountAbstractionModel.updateOne(
          {
            _id: getAccountAbstractionDetails._id,
            userId: getAccountAbstractionDetails.userId,
            "demoCallDetails.isCallbooked": true,
          },
          {
            $set: {
              "demoCallDetails.didUserAttendedCall": true,
              isSDKDocsShared: true,
            },
          }
        );
      }

      if (
        didUserAttendedCall === false &&
        getData.demoCallDetails.startDate.toString() <= new Date().toString()
      ) {
        const INVITE_NOW_SHOW_URL = "https://api.calendly.com/invitee_no_shows";

        const options = {
          method: "POST",
          url: INVITE_NOW_SHOW_URL,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PERSONAL_ACCESS_TOKEN}`,
          },
          data: {
            invitee: getData.demoCallDetails.inviteeURL,
          },
        };

        const createNoShow = await axios.request(options);

        const updateCallStatus = await AccountAbstractionModel.updateOne(
          {
            _id: getAccountAbstractionDetails._id,
            userId: getAccountAbstractionDetails.userId,
            "demoCallDetails.isCallbooked": true,
          },
          {
            $set: {
              "demoCallDetails.didUserAttendedCall": false,
              "demoCallDetails.status": message
                ? message
                : "User didn't attend call.",
            },
          }
        );
      }

      return {
        message: "Call status updated successfully.",
        statusCode: 200,
        success: true,
      };
    }
    return {
      message: "No record to update",
      statusCode: 404,
      success: false,
    };
  } catch (error) {
    return {
      message: "Something went wrong.",
      statusCode: 500,
      success: false,
    };
  }
};
