const { ipcRenderer } = require('electron')

function init() {
    ipcRenderer.on('new-tx', function () {
        ipcRenderer.send('loadTxs')
    })

    ipcRenderer.on('balance-query-done', function(){
        console.log('new-tx trigger: loadTxs')
        ipcRenderer.send('loadTxs')
    })

    ipcRenderer.on('new-delegation', function () {
        console.log('new delegation')
        ipcRenderer.send('load-delegations')
    })

    ipcRenderer.send('start-watching')
}

export default {
    init: function () {
        init()
    }
}