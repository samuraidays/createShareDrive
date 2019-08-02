function createShareDriveFlow(formdata) {

  var applicant=formdata[1]; // 申請者
  var drivename=formdata[2]; // 作成する共有ドライブ名
  var newmember=formdata[4]; // 管理者として設定するメールアドレス
  var requestID=getLastRowWithValue(); // 最後の行数をrequestIDに設定

  
  // 同じ名前のドライブ名があるかチェックし、あったら終了する
  var errtx = searchNewDrive(drivename);
  if(errtx.items[0] !== '') {
    errtx = drivename + "ドライブは作成されています！他のドライブ名に変えて申請してください"
    callSlackWebhook(applicant, errtx);
    return;
  }

  // 共有ドライブを作成
  var errtx = createShareDrive(drivename, requestID);

  // エラーをSlackへ通知
  if(errtx !== 'ok'){
    callSlackWebhook(applicant, errtx);
    return;
  }

  // 作成したドライブのID取得
  var newdrv = searchNewDrive(drivename);
  var newdrvid = newdrv.items[0].id;
  
  // 管理者としてメンバー追加
  var errtx = addManageMember(newmember, newdrvid);
  if(errtx !== 'ok'){
    callSlackWebhook(applicant, errtx);
    return;
  }
  
  // Slackへの通知
  if(errtx == 'ok'){
    var tx = drivename + '共有ドライブが作成されました！';
    callSlackWebhook(applicant, tx);
    return;
  } else {
    var tx = drivename + '共有ドライブの作成に失敗しました！';
    callSlackWebhook(applicant, tx);
    return;
  }
}

//　共有ドライブを作成する関数
function createShareDrive(drivename, requestID) {
  try {
    var params = {
      "name": drivename,
    }; 
    var newdrv = Drive.Drives.insert(params, requestID);
    return 'ok';
  } catch(e) {
    // エラーメッセージを返す
    var error = drivename + 'ドライブ作成に失敗しました。このメッセージを#corp_itに投げてください' + '\n' + 'name：'　+ e.name + '\n' + 'message：'　+ e.message
    return error;
  }
}

// ドライブオブジェクトをゲットする
function searchNewDrive(drivename) {
  var query = 'name="' + drivename + '"';
  var searchorg = {
    "q": query,
    "useDomainAdminAccess": true,
  };
  
  var newdrv = Drive.Drives.list(searchorg);
  return newdrv
}

// 管理者メンバーを追加する関数
function addManageMember(newmember, newdrvid) {
  try {
    var new_owner = {
      "value": newmember,
      "type": "group",
      "role": "organizer",
    };

    var options = {
      "supportsAllDrives": true,
      "useDomainAdminAccess": true,
    };
    
    var newdrv = Drive.Permissions.insert(new_owner, newdrvid, options);

    return 'ok';
  } catch(e) {
    // エラーメッセージを返す
    var error = newmember + '追加に失敗しました。このメッセージを#corp_itに投げてください' + '\n' + 'name：'　+ e.name + '\n' + 'message：'　+ e.message
    return error;
  }
}

// 最後の行数を取得する関数
function getLastRowWithValue() {
  const sheet = SpreadsheetApp.getActiveSheet(); 
  const columnBVals = sheet.getRange('A:A').getValues(); // A列「タイムスタンプ」の値を配列で取得
  const LastRow = columnBVals.filter(String).length;  //空白を除き、配列の数を取得

  return LastRow
}