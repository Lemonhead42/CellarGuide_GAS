function debug_listInventory() {
  var e = {
    parameter: {
      token: getSecretToken(),
      action: 'listInventory'
    }
  };

  var res = handleRequest(e, 'GET');
  Logger.log(res.getContent());
}