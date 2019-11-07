const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function init(){

    ipcMain.on('load-txs', (event) => {
        stancli.updateBalanceAndTxs(event)
    })

    // // @TODO change
    // ipcMain.on('loadTxs', (event, limit) => {
    //     stancli.loadTxs(event, limit)
    // })
}


module.exports = {
    init: function () {
        init()
    }
}