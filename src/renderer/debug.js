const { ipcRenderer } = require('electron')

ipcRenderer.on('debug', function (e, a) {
    console.log('/\\-------------------  DEGUG  -------------------/\\')
    console.log(a)
});