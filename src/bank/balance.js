const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function init(){
    // Handle form submit
    ipcMain.on('get-balance', (event, notify) => {
        stancli.getAccountBalance(event, notify)
    });
}

module.exports = {
    init: function () {
        init()
    }
};