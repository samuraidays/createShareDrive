function onFormSubmit(e) {
  var formdata = e.values;
  var applicant=formdata[1];
  var drivename=formdata[2]; // 作成する共有ドライブ名
  var description=formdata[3]; // 用途
  var newmail=formdata[4]; // 管理者として設定するメールアドレス
  var external=formdata[5]; // 社外ゲストの接続の有無
  var infotype=formdata[6]; // 取り扱う情報
  
  switch(infotype){
    case "社内公開可":
      createShareDriveFlow(formdata);
      break;

    case "制限情報":
      createShareDriveFlow(formdata);
      break;
      
    case "機密情報あり":
      var basetxt = applicant + 'さんから、' + '共有ドライブ作成の申請が「機密情報あり」で申請されました!\n' + '確認後の作成になりますので、しばらくお待ち下さい'
      var addApplicant = '申請者: ' + applicant + '\n'
      var addDrivename = '共有ドライブ名: ' + drivename + '\n'
      var addDesc = '共有ドライブの用途: ' + description + '\n'
      var addNewmail = '共有ドライブのオーナー: ' + newmail + '\n'
      var addExternal = '社外ゲストの接続の有無: ' + external + '\n'
      var addInfo = '取り扱う情報について: ' + infotype + '\n'
      var optiontxt = addApplicant + addDrivename + addDesc + addNewmail + addExternal + addInfo
      callSlackWebhook(applicant, basetxt)
      sendSlackCoprItInternal(basetxt, optiontxt)
      break;
      
    default:
      break;
  }
  
}