const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function init(){

    // Handle form submit
    ipcMain.on('delete-key', (event, label) => {
        // Create new key with form data
        stancli.deleteKey(event, label)
    })
}


module.exports = {
    init: function () {
        init()
    }
};