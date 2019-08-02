function onFormSubmit(e) {
  var formdata = e.values;
  var infotype = formdata[6]
  
  switch(infotype){
    case "社内公開可":
      createShareDriveFlow(formdata);
      break;

    case "制限情報":
      createShareDriveFlow(formdata);
      break;

    default:
      break;
  }
  
}
