const { ipcRenderer } = require('electron')
const numeral = require('numeral')
let balanceValueElm = document.getElementById('balance-value')
const kvStore = require('../../storage/main')

function init(){
    // Load delegations from cache first
    let coins = new kvStore({name: 'auth'}).getCoins()
    if (coins !== undefined) {
        setComponentValues(coins)
    }

    ipcRenderer.on('got-balance', function(event, resp){
        setComponentValues(resp)

        // Set cache
        let walletStore = new kvStore({name: 'auth'})
        walletStore.setCoins(resp)
    })
}

function setComponentValues(coins) {
    // Set html
    balanceValueElm.innerHTML = numeral(coins).format('0,0[.]000000')

    // Calculate dollar value
    // @TODO do this dynamically (probably with exchange API)
    let dollarValue = coins * 0.12
    document.getElementById('fiat-value').innerHTML = numeral(dollarValue).format('$0,0[.]00')
}


module.exports = {
    init: function () {
        init()
    }
};