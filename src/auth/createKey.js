const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function initFormListener(){

    // Handle form submit
    ipcMain.on('create-key', (event, arg) => {

        // Get sanitized user input
        let key_label = arg[0].replace(/(["\s'$`\\])/g,'\\$1')
        let key_pwd = arg[1].replace(/(["\s'$`\\])/g,'\\$1')

        // Create new key with form data
        stancli.createPrivateKey(key_label, key_pwd, event)
    })
}


module.exports = {
    addFormListener: function () {
        initFormListener()
    }
};