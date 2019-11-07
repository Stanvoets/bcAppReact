const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function init(){

    // Handle form submit
    ipcMain.on('load-addresses', (event) => {
        stancli.loadAddresses(event)
    })
}

module.exports = {
    init: function () {
        init()
    }
};