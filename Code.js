function run() {
  const scriptProperties   = PropertiesService.getScriptProperties();
  const documentProperties = PropertiesService.getDocumentProperties();
  const feedUrl            = scriptProperties.getProperty("feed_url");
  const sheet              = SpreadsheetApp.getActiveSheet();

  let lastUpdated = documentProperties.getProperty("lastUpdated");
  lastUpdated = lastUpdated === null ? 0 : parseInt(lastUpdated);

  let feed = "";

  try {
    feed = UrlFetchApp.fetch(feedUrl).getContentText();
  } catch (e) {
    reportError(e);
    return ;
  }

  const doc     = XmlService.parse(feed);
  const root    = doc.getRootElement();
  const atom    = XmlService.getNamespace("http://www.w3.org/2005/Atom");
  const entries = root.getChildren("entry", atom);

  if(!entries.length) return ;
  entries = entries.filter( entry => {
    const published = new Date(entry.getChild("published", atom).getText());
    return published > lastUpdated;
  });

  entries.forEach( entry => {
  const published = new Date(entry.getChild("published", atom).getText());
    const publishedDateString = published.toDateString();
    const publishedTimeString = published.toTimeString();
    const summary             = entry.getChild("summary", atom).getText();
    const content             = entry.getChild("content", atom).getText();
    const title               = entry.getChild("title", atom).getText();

    sheet.insertRowBefore(2);
    sheet.getRange("A2:D2").setValues([[publishedDateString, publishedTimeString, summary, content]]);
    postMessageToDiscord(title, content);
    documentProperties.setProperty("lastUpdated", published.getTime().toString());
    Utilities.sleep(1000);
  });
}

function test() {
  postMessageToDiscord("test", "Test message!");
}

function postMessageToDiscord(title, message) { 
  const scriptProperties = PropertiesService.getScriptProperties();
  const discordWebhook   = scriptProperties.getProperty("discord_webhook");
  let payload;
  
  if(title) payload = JSON.stringify({content: `**${title}**\n${message}`});
  else payload = JSON.stringify({content: message});
  
  var params = {
    headers: {
      "Content-Type": "application/json"
    },
    method            : "POST",
    payload           : payload,
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(discordWebhook, params);
  } catch (e) {
    console.error(e);
  }
}

function reportError(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let errorSheet = spreadsheet.getSheetByName('Error Log');
  if(errorSheet === null) {
    errorSheet = spreadsheet.insertSheet('Error Log');
    const headerRange = errorSheet.getRange('A1:D1');
    const headerTitles = [ [ 'Time', 'File', 'Line', 'Error' ] ];
    headerRange.setValues(headerTitles);
    errorSheet.setFrozenRows(1);
  }
  
  const lastRow     = errorSheet.getLastRow();
  const lastCol     = errorSheet.getLastColumn();
  const errorRange  = errorSheet.getRange(lastRow +1, 1, 1, lastCol);
  const errorValues = [ [ new Date().toString(), e.fileName, e.lineNumber, e.message ] ];

  errorRange.setValues( errorValues );
}
