const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function initFormListener(){

    // Handle form submit
    ipcMain.on('send-tx', (event, arg) => {

        // Get sanitized user input
        let address = arg[0].replace(/(["\s'$`\\])/g,'\\$1')
        let amount = arg[1].replace(/(["\s'$`\\])/g,'\\$1')
        let password = arg[2]

        stancli.sendTx(address, amount, password, event)
    });
}


module.exports = {
    addFormListener: function () {
        initFormListener()
    }
};