// Slackのwebhookにリクエストを送る
function callSlackWebhook(applicant, messages) {
  // webhook設定
  var sp = PropertiesService.getScriptProperties();
  var SLACK_WEBHOOK_URL = sp.getProperty('SLACK_WEBHOOK_URL');
  
  // 申請者メールアドレスからSlackIDへ変換
  var suserid = getSlackUserId(applicant);
  // 申請者メールアドレスがある→@つける、ない→@itへ
  if(suserid !== 'none'){
    suserid = '@' + suserid;
  } else {
    suserid = '@it'
  }
  
  // 通知するデータ
  var params = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      channel: suserid, // 通知するチャンネル
      text: messages,
      link_names: 1,
    })
  };
  // slack通知
  var response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, params);
  return response;
}

// 申請者のEメールからSlackIDを取得する
function getSlackUserId(applicant) {
  // アクセストークンを取得
  var sp = PropertiesService.getScriptProperties();
  var SLACK_ACCESS_TOKEN = sp.getProperty('SLACK_ACCESS_TOKEN');
  
  // API設定
  var slackURLBase = "https://slack.com/api"
  var slackUserListAPI = slackURLBase + "/users.list?token=" + SLACK_ACCESS_TOKEN
  
  // APIを実行しユーザリストを取得する
  var res = UrlFetchApp.fetch(slackUserListAPI) 
  var data = JSON.parse(res);  // APIから得られたデータを連想配列に変換する

  var userid;
  // 取得したユーザリストと申請者メールアドレスを突き合わせる
  for (var i in data.members) {
    if(data.members[i].profile.email == applicant){
      userid = data.members[i].id;
      break;
    } else {
      userid = 'none';
    }
  }
  return userid;
}
  
// Slackの#corp_it_internalに通知する
function sendSlackCoprItInternal(messages) {
  // webhook設定
  var sp = PropertiesService.getScriptProperties();
  var SLACK_WEBHOOK_URL = sp.getProperty('SLACK_WEBHOOK_URL');
  
  // 通知するデータ
  var params = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      text: messages,
      link_names: 1,
    })
  };
  // slack通知
  var response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, params);
  return response;
}