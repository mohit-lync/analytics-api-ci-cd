const versionModel = require("../model/versioning");
const productSchema = require("../model/products");
const mongoose = require("mongoose");

exports.getVersionDetails = async (query) => {
  try {
    const { versionId, productName } = query;
    let q = {};
    if (versionId) {
      q = { _id: versionId };
    }
    if (productName) {
      q = { productName };
    }
    let versionDetails;
    if (q !== {}) {
      versionDetails = await versionModel.find(q);
      if (!versionDetails)
        return {
          message: "No product found.",
          success: false,
          data: [],
          statusCode: 400,
        };
    } else {
      versionDetails = await versionModel.find({});
    }
    if (
      versionDetails &&
      versionDetails.length > 0 &&
      Array.isArray(versionDetails)
    ) {
      return {
        message: "Product version details.",
        success: true,
        data: versionDetails,
        statusCode: 200,
      };
    }

    return {
      message: "No version details available.",
      success: false,
      data: [],
      statusCode: 404,
    };
  } catch (error) {
    throw error;
  }
};

exports.insertVersionDetails = async (req) => {
  try {
    const { productName, version } = req.body;
    if (!productName) {
      return {
        message: "Product name is required.",
        success: false,
        data: [],
        statusCode: 400,
      };
    }
    if (!version) {
      return {
        message: "Version number is required.",
        success: false,
        data: [],
        statusCode: 400,
      };
    }
    const checkProduct = await versionModel.find({ productName });
    if (checkProduct && checkProduct.length > 0) {
      return {
        message: "Product already exists.",
        success: false,
        data: [],
        statusCode: 400,
      };
    }
    const insert = await versionModel.create({
      productName,
      version,
    });
    const products = mongoose.model(
      productName,
      productSchema,
      productName.toLowerCase()
    );

    return {
      message: "Version details added successfully.",
      success: true,
      data: insert,
      statusCode: 201,
    };
  } catch (error) {
    throw error;
  }
};

exports.updateVersionDetails = async (req) => {
  try {
    const { productName } = req.query;
    if (!productName) {
      return {
        message: "Product name is required.",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    const { version } = req.body;

    if (!version) {
      return {
        message: "Version number is required.",
        success: false,
        data: [],
        statusCode: 400,
      };
    }

    const checkProduct = await versionModel.find({ productName });
    if (!checkProduct) {
      return {
        message: "Product not found.",
        success: false,
        data: [],
        statusCode: 404,
      };
    }

    const update = await versionModel.findOneAndUpdate(
      {
        productName: productName,
      },
      {
        version,
      }
    );
    return {
      message: "Version details updated successfully.",
      success: true,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
