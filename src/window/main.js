const { BrowserWindow } = require('electron')
const { appRoot } = require('electron-root-path')
const path = require('path')

const defaultSettings = {
    width: 870,
    height: 780,
    show: false,
    resizable: false,
    // backgroundColor: '#37BE72',
    autoHideMenuBar: true,
    // icon: path.join(appRoot, 'img', 'tray-icon.png'),
    webPreferences: {
        nodeIntegration: true
    }
}

class Window extends BrowserWindow {
    constructor ({ file, ...windowSettings }) {

        super({ ...defaultSettings, ...windowSettings })

        if (file !== undefined) {
            this.loadFile(file)
        }

        this.once('ready-to-show', () => {
            this.show()
        })
    }
}

module.exports = Window