const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function initFormListener(){

  // Handle form submit
  ipcMain.on('unlockPrivKeysubmitForm', (event, arg) => {

    // Get sanitized user input
    let key_label = arg[0].replace(/(["\s'$`\\])/g,'\\$1')
    let key_pwd = arg[1].replace(/(["\s'$`\\])/g,'\\$1')

    stancli.privKeyAuth(key_label, key_pwd, event)
  });
}


module.exports = {
  addFormListener: function () {
    initFormListener()
  }
};