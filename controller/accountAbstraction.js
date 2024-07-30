const {
  insert,
  insertCallDetails,
  getCallDetails,
  updateCallDetails,
} = require("../api/accountAbstraction");
const excelJS = require("exceljs");

exports.insert = async (req, res) => {
  try {
    const insertdata = await insert(req);
    return res.status(insertdata.statusCode).json(insertdata);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.insertCallDetails = async (req, res) => {
  try {
    const insertdata = await insertCallDetails(req);
    return res.status(insertdata.statusCode).json(insertdata);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.getCallDetails = async (req, res) => {
  try {
    const get = await getCallDetails(req);
    return res.status(get.statusCode).json(get);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.updateCallDetails = async (req, res) => {
  try {
    const update = await updateCallDetails(req);

    return res.status(update.statusCode).json(update);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

exports.downloadExcel = async (req, res) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet("User Demo Call Details");

  const filename = "user-call-details.xlsx";

  const getUserDetail = await getCallDetails(req);

  worksheet.columns = [
    { header: "S no.", key: "s_no", width: 10 },
    { header: "Name", key: "name", width: 12 },
    { header: "Game Name", key: "gameName", width: 15 },
    { header: "Game Description", key: "gameDescription", width: 20 },
    { header: "Email Address", key: "email", width: 10 },
    { header: "Wallet Address", key: "walletAddress", width: 50 },
    { header: "Category", key: "category", width: 20 },
    { header: "Platform Chosen", key: "platform", width: 20 },
    { header: "Did User Attend Call?", key: "didUserAttendedCall", width: 15 },
    { header: "Did User Book Call?", key: "isCallbooked", width: 15 },
    { header: "API Key Generated", key: "isApiKeyGenerated", width: 10 },
    { header: "SDK Doc Shared", key: "isSDKDocsShared", width: 10 },
    { header: "Demo Call Status", key: "callStatus", width: 20 },
    { header: "Call Start Date", key: "callStartDate", width: 10 },
    { header: "Call End Date", key: "callEndDate", width: 10 },
  ];

  let counter = 1;

  getUserDetail.data.forEach((user) => {
    user.s_no = counter;
    user.didUserAttendedCall = user.didUserAttendedCall ? "No" : "yes";
    user.isCallbooked = user.isCallbooked ? "No" : "yes";
    user.isApiKeyGenerated = user.isApiKeyGenerated === true ? "Yes" : "No";
    user.isSDKDocsShared = user.isSDKDocsShared === true ? "Yes" : "No";
    worksheet.addRow(user);
    counter++;
  });

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=" + filename);

  return workbook.xlsx.write(res).then(() => {
    res.status(200).end();
  });
};
