function createShareDriveFlow(formdata) {

  var applicant=formdata[1]; // 申請者
  var drivename=formdata[2]; // 作成する共有ドライブ名
  var newmember=formdata[4]; // 管理者として設定するメールアドレス
  var external=formdata[5]; // 社外ゲストの接続の有無
  var secinfo=formdata[6]; // 取り扱う情報
  var requestID=getLastRowWithValue(); // 最後の行数をrequestIDに設定

  
  // 同じ名前のドライブ名があるかチェックし、あったら終了する
  var errtx = searchDrive(drivename);

  /*
  if(errtx.items !== '') {
    errtx = drivename + "ドライブは作成されています！他のドライブ名に変えて申請してください"
    callSlackWebhook(applicant, errtx);
    return;
  }
*/
  if(external == 'あり') {
    drivename = drivename + '👤';
  }
  
  // 共有ドライブを作成
  var [errtx, newdrvid] = createShareDrive(drivename, requestID);
  
  // エラーをSlackへ通知
  if(errtx !== 'ok'){
    callSlackWebhook(applicant, errtx);
    return;
  }
  
  // 管理者としてメンバー追加
  var errtx = addManageMember(newmember, newdrvid);
  if(errtx !== 'ok'){
    callSlackWebhook(applicant, errtx);
    return;
  }
  
  // 共有ドライブの設定変更
  // 社外ゲストあり, 制限情報
  if(external == 'あり' && secinfo == '制限情報'){
    var errtx = updateShareDrive(newdrvid, false, true, false);

    // エラー時の通知
    if(errtx !== 'ok'){
      callSlackWebhook(applicant, errtx);
      return;
    }
  }
  
  // 社外ゲストあり, 社内公開可
  if(external == 'あり' && secinfo == '社内公開可'){
    var errtx = updateShareDrive(newdrvid, false, false, false);

    // エラー時の通知
    if(errtx !== 'ok'){
      callSlackWebhook(applicant, errtx);
      return;
    }
  }
  
  // 社外ゲストなし, 制限情報
  if(external == 'なし' && secinfo == '制限情報'){
    var errtx = updateShareDrive(newdrvid, true, true, false);

    // エラー時の通知
    if(errtx !== 'ok'){
      callSlackWebhook(applicant, errtx);
      return;
    }
  }
  // 社外ゲストなし, 社内公開可
  if(external == 'なし' && secinfo == '社内公開可'){
    var errtx = updateShareDrive(newdrvid, true, false, false);

    // エラー時の通知
    if(errtx !== 'ok'){
      callSlackWebhook(applicant, errtx);
      return;
    }
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

/*************************************
   以下、各関数の定義
*************************************/

//　共有ドライブを作成する関数
function createShareDrive(drivename, requestID) {
  try {
    var params = {
      "name": drivename,
    }; 
    var newdrv = Drive.Drives.insert(params, requestID);
    var a='ok'
    var newdrvid = newdrv.id
    return [a, newdrvid]

  } catch(e) {
    // エラーメッセージを返す
    var error = drivename + 'ドライブ作成に失敗しました。このメッセージを#corp_itに投げてください' + '\n' + 'name：'　+ e.name + '\n' + 'message：'　+ e.message
    var a='NG'
    return [a, error]
  }
}

// ドライブオブジェクトをゲットする
function searchDrive(drivename) {
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

// 共有ドライブの設定を変更する関数
function updateShareDrive(newdrvid, domainonly, driveonly, copy) {
  try {
    var params = {
      "useDomainAdminAccess": true,
    }; 
    
    var options = {
      "restrictions": {
        "domainUsersOnly": domainonly,
        "driveMembersOnly": driveonly,
        "copyRequiresWriterPermission": copy,
      }
    };
    Drive.Drives.update(options, newdrvid, params)
    return 'ok';
  } catch(e) {
    // エラーメッセージを返す
    var error = 'ドライブ設定変更に失敗しました。このメッセージを#corp_itに投げてください' + '\n' + 'name：'　+ e.name + '\n' + 'message：'　+ e.message
    Logger.log(e);
    return error;
  }
}