const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function init(){

    ipcMain.on('load-txs', (event) => {
        stancli.updateBalanceAndTxs(event)
    })
}


module.exports = {
    init: function () {
        init()
    }
}