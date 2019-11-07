const { ipcMain } = require('electron')

function initHandlers() {

    // Main handlers
    ipcMain.on('routing', (event, args) => {
        let activeWindow = event.sender.getOwnerBrowserWindow()
        activeWindow.webContents.send('change-section', args[0])
    })
}

module.exports = {
    init: function () {
        initHandlers()
    }
}