// Load unclaimed coins from cache
const { ipcRenderer } = require('electron')
const kvStore = require('../storage/main')

function init () {
    let unclaimed = new kvStore({name: 'staking'}).getUnclaimedCoins()
    if (unclaimed !== undefined) {
        setStakingRewardValues(unclaimed)
    }

    // Load unclaimed coins
    ipcRenderer.send('load-staking-rewards')


    ipcRenderer.on('loaded-staking-rewards', function(event, coins){
        setStakingRewardValues(coins)
    })

    function setStakingRewardValues(coins){
        document.querySelectorAll('.unclaimed-staking-rewards').forEach(function(elm){
            elm.innerHTML = `<span class="amount"">${coins}</span> stan to be claimed`
        })
    }

    document.querySelectorAll('.popup-trigger--password-confirm--claim-staking').forEach(function(elm){
        elm.addEventListener('click', () => {
            document.querySelector(`#password-confirm--claim-staking .tx-summary .confirm-action`).innerHTML = document.querySelector('#delegate .unclaimed-staking-rewards').innerHTML
        })
    })
}

export default {
    init: function () {
        init()
    }
}