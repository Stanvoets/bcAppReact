const CronJob = require('cron').CronJob
const stancli = require('../cmd/stancli')
const { ipcMain } = require('electron')

// Start a cron job that watches for changes in the account balance
// combined with sequence to detect new tx.
function init() {
    ipcMain.on('start-watching', function(event){

        // Txs
        new CronJob('*/8 * * * * *', function(){
            checkForNewTx(event)
        }, null, true)

        // Staking rewards
        new CronJob('* */1 * * * *', function(){
            checkForStakingRewards(event)
        }, null, true)
    })
}

// Check if there are new TX and send event to renderer if so.
function checkForNewTx(event) {
    stancli.updateBalanceAndTxs(event)
}

function checkForStakingRewards(event) {
    stancli.loadStakingRewards(event)
}

module.exports = {
    init: function () {
        init()
    }
}