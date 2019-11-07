const { ipcMain } = require('electron')
const stancli = require('../cmd/stancli')

function init(){

    // Handle form submit
    ipcMain.on('delegate-tx', (event, delAddr, valAddr, amount, pwd) => {
        // Get sanitized user input
        valAddr = valAddr.replace(/(["\s'$`\\])/g,'\\$1')
        amount = amount.replace(/(["\s'$`\\])/g,'\\$1')

        stancli.delegateTx(event, delAddr, valAddr, amount, pwd)
    })

    ipcMain.on('claim-staking-rewards', (event, pwd, delegations = undefined) => {
        stancli.claimStakingRewards(event, pwd, delegations)
    })

    ipcMain.on('claim-delegation-reward', (event, pwd, delegation) => {
        stancli.claimDelegationReward(event, pwd, delegation)
    })

    ipcMain.on('redelegate', (ipcEvent, password, delegation, newValAddr, amount) => {
        stancli.redelegate(ipcEvent, password, delegation, newValAddr, amount)
    })

    ipcMain.on('unbond', (ipcEvent, password, delegation, amount) => {
        stancli.unbond(ipcEvent, password, delegation, amount)
    })

    ipcMain.on('load-staking-rewards', (event) => {
        stancli.loadStakingRewards(event)
    })

    ipcMain.on('load-delegations', (event) => {
        stancli.loadDelegations(event)
    })

    ipcMain.on('load-unbonding-delegations', (event) => {
        stancli.loadUnbondingDelegations(event)
    })
}


module.exports = {
    init: function () {
        init()
    }
};