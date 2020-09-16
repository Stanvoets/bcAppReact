const isDev = require('electron-is-dev');
const { ipcMain } = require('electron')
const Window = require('.//main')
const path = require('path')
const { Approot } = require('electron-root-path')
const windowStateKeeper = require('electron-window-state')

function initWindowManager(){
    ipcMain.on('load-main-app', (event, arg) => {
        // Get current acitve window (login window)
        let activeWindow = event.sender.getOwnerBrowserWindow()

        // Open main app
        //@TODO Keep this hardcoded?
        let window = createWindow()
        window.once('ready-to-show', function(){
            activeWindow.close()
        })
    });
}

function createWindow() {
    let windowState = windowStateKeeper({
        defaultWidth: 1350,
        defaultHeight: 725
    })

    // Create the browser window.
    let window = new Window({
        width: 1300,
        height: 750,
        x: windowState.x,
        y: windowState.y
    })

    console.log(`DEV MODE: ${isDev}`)
    window.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(Approot, 'src','index.js')}`)
    if (isDev) {
        //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
        // Open the DevTools.
        window.webContents.openDevTools()
    }

    // Watch for ready event.
    window.webContents.on('dom-ready', () => {
        window.webContents.send('content-rendered')
        window.webContents.openDevTools()
    })

    // Old @TODO remove
    // loadFile(window, path.join(Approot, 'renderer', file))

    // Add to state manager
    windowState.manage(window)

    return window
}

module.exports = {
    init: function () {
        let window = createWindow()
        initWindowManager()
        // #TODO fix
        // window.addDevToolsExtension('C:/Users/stanv/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.2.0_0')
        return window
    },
};