function getMailMessage(mail) {
  Logger.log(mail.getSubject());
  let subject = mail.getSubject();
  let newsLink = getLink(mail);
  let date = mail.getDate();
  const params = {
    'subject' : subject,
    'news_link' : newsLink,
    'date': date
  };
  return params;
}

function getLink(mail) {
  const messageBody = mail.getBody();
  return messageBody.match(/https:\/\/mxb\.nikkei\.com\/\?[^"]+/)[0];
}

function writeToSpreadSheet(param) {
  const id = "spreadSheetのidをここに";
  const spreadSheet = SpreadsheetApp.openById(id);
  const sheet = spreadSheet.getActiveSheet();

  sheet.appendRow([param.subject, param.news_link, param.date]);
}

function sendDiscord(params) {
  const WEBHOOK_URL = 'Discodeのwebhook URLをここに';
  const payload = {
    username: "URL発行するときに設定したusername",
    content: params.subject + '\n' + params.news_link
  }
  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  });
}

function trigger() {
  let now = new Date();
  let query = 'from:sokuho-news@mx.nikkei.com '
    + 'is:unread ' 
    + 'after:' + Math.floor((now.setHours(now.getHours() - 8)) / 1000);
  let threads = GmailApp.search(query);

  // 8時間以内に受け取ったスレッドに対して繰り返す
  threads.forEach(function(thread){
    // スレッド内のメール一覧を取得
    let mails = thread.getMessages();
    mails.forEach(function(mail){
      const param = getMailMessage(mail);
      sendDiscord(param);
      writeToSpreadSheet(param);
    });
  });
}
