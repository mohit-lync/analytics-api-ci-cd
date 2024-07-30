var uniqueData = {};

function connectToMongDB() {
  var url = "https://us-east-1.aws.data.mongodb-api.com/app/application-0-xfdqp/endpoint/getData"; // Replace with your API endpoint
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());

  var startRow = sheet.getLastRow() + 1; // Get the starting row to append the data

  // var uniqueData = getUniqueData();

  data.forEach(function(entry) {
    // Check if the entry's _id is already present in the uniqueData object
    if (!uniqueData[entry._id]) {
      var rowData = [
        entry._id,
        entry.userId,
        entry.demoCallDetails._id,
        entry.createdAt,
        entry.demoCallDetails.name,
        entry.demoCallDetails.email,
        entry.platform,
        entry.chainId,
        entry.isApiKeyGenerated,
        entry.isSDKDocsShared,
        entry.demoCallDetails.didUserAttendedCall,
        entry.demoCallDetails.isCallbooked
      ];

      var existingRow = findRowByEntryId(sheet, entry._id);
      if (existingRow > 0) {
        var existingValues = sheet.getRange(existingRow, 1, 1, rowData.length).getValues()[0];
        if (!areArraysEqual(existingValues, rowData)) {
          sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
          updateFieldColors(sheet, existingRow, rowData);
        }
      } else {
        sheet.appendRow(rowData);
        updateFieldColors(sheet, startRow, rowData); // Apply color updates for the newly inserted row
      }

      uniqueData[entry._id] = true; // Set the entry's _id as a property in the uniqueData object
    }
  });

  saveUniqueData(uniqueData); // Save the updated uniqueData

  Logger.log("Data saved to Excel successfully. Spreadsheet URL:");
}

function findRowByEntryId(sheet, entryId) {
  var lastRow = sheet.getLastRow();
  var values = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === entryId) {
      return i + 1;
    }
  }
  return 0;
}

function areArraysEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }
  for (var i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

function getUniqueData() {
  var properties = PropertiesService.getDocumentProperties();
  var uniqueDataJson = properties.getProperty("uniqueData");

  if (uniqueDataJson) {
    return JSON.parse(uniqueDataJson);
  }

  return {};
}

function saveUniqueData(uniqueData) {
  var properties = PropertiesService.getDocumentProperties();
  var uniqueDataJson = JSON.stringify(uniqueData);
  properties.setProperty("uniqueData", uniqueDataJson);
}

function applyConditionalFormatting(sheet, startRow, endRow) {
  var range = sheet.getRange(startRow, 1, endRow - startRow + 1, 13); // Adjust the range based on the number of columns

  // Retrieve the cell values within the range
  var values = range.getValues();

  // Loop through each cell and apply conditional formatting
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var cellValue = values[i][j];
      var cell = range.getCell(i + 1, j + 1);

      if (typeof cellValue === "boolean") {
        if (cellValue) {
          cell.setBackgroundColor("#00FF00"); // Green for true
        } else {
          cell.setBackgroundColor("#FF0000"); // Red for false
        }
      }
    }
  }
}

function updateFieldColors(sheet, row, rowData) {
  for (var i = 0; i < rowData.length; i++) {
    var cell = sheet.getRange(row, i + 1);
    var value = rowData[i];

    if (typeof value === "boolean") {
      var color = value ? "#00FF00" : "#FF0000";
      cell.setBackground(color);
    }
  }
}

function onEdit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var editedCell = e.range;
  var column = editedCell.getColumn();

  // Check if the edited cell is in the "didUserAttendedCall" column (column 11 in this case)
  if (column === 11) {
    var email = sheet.getRange(editedCell.getRow(), 6).getValue(); // Get the email from column 6 (demoCallDetails.email)
    var didUserAttendedCall = editedCell.getValue();

    // Make the POST request with email and didUserAttendedCall as parameters
    sendPostRequest(email, didUserAttendedCall);
  }
}

function sendPostRequest(email, didUserAttendedCall) {
  var url = "testanalyticserver.lync.world/account-abstraction/updateCallDetails"; // Replace with your API endpoint URL
  var payload = {
    email: email,
    didUserAttendedCall: didUserAttendedCall
  };
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url, options);
  // Log the response if needed
  Logger.log(response.getContentText());
}