function doGet(request) {
  const spreadsheetId = '1vbJgtw0mr7rYhWT41RNC9BJtQa_qawDdGX5PavGCc-E';
  const rangeValues = 'Class Data!A2:B';

  const values = Sheets.Spreadsheets.Values.get(spreadsheetId, rangeValues).values;

  var result = values.reduce((acc, row) => {
    return [...acc, {
      ag: Utilities.base64Encode(row[0]),
      id: Utilities.base64Encode(row[1]),
    }]
  }, []);

  return ContentService.createTextOutput(request.parameters.portal + '(' + JSON.stringify(result) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
