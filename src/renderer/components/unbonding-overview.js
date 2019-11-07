const numeral = require('numeral')
const conversion = require('../../bank/conversion')
let elmContainer = document.querySelector('.unbonding-delegations')
const kvStore = require('../../storage/main')
let currDelgs = []
const addressCache = new kvStore({name: 'address-cache'})
const { ipcRenderer } = require('electron')

function init(){
    // Load txs from cache first
    let unbondDels = new kvStore({name: 'unbonding-delegations'}).getUnbondingDelegations()
    if (unbondDels.length) {
        setComponentValues(unbondDels)
    }

    ipcRenderer.send('load-unbonding-delegations')

    ipcRenderer.on('loaded-unbonding-delegations', function(event, resp){
        setComponentValues(resp)
    })
}

function setComponentValues(unbondDels){
    let unbondDelElm

    if (!unbondDels.length) {
        elmContainer.innerHTML = 'You have no delegations that are currently unbonding.'
    }
    else {
        unbondDels.forEach(function (unbondDel) {
            let delAddr = unbondDel.delegator_address
            let valAddr = unbondDel.validator_address

            // Init array with current del
            if(currDelgs[delAddr] === undefined) {
                currDelgs[delAddr] = []
            }

            if (!currDelgs[delAddr].includes(valAddr)) {
                // Create unbondDel
                unbondDelElm = document.createElement('div')
                unbondDelElm.setAttribute('data-address-sender', delAddr)
                unbondDelElm.setAttribute('data-address-recipient', valAddr)
                unbondDelElm.classList.add('unbonding-delegation-item')
                unbondDelElm.classList.add('sh-block')

                let delLabel = addressCache.getAddressLabel(delAddr)
                delLabel = document.createTextNode(delLabel)
                let delLabelDiv = document.createElement('div')
                delLabelDiv.classList.add('sender')
                delLabelDiv.appendChild(delLabel)

                let address = document.createTextNode(valAddr)
                let addressDiv = document.createElement('div')
                addressDiv.classList.add('recipient')
                addressDiv.appendChild(address)
                let addressWrapper = document.createElement('div')

                let unbondEntries = document.createElement('div')
                unbondEntries.classList.add('unbond-entries')

                unbondEntries.innerHTML = updateEntries(unbondDel.entries)

                addressWrapper.classList.add('address-wrapper')
                addressWrapper.appendChild(delLabelDiv)
                addressWrapper.appendChild(addressDiv)
                addressWrapper.appendChild(unbondEntries)

                unbondDelElm.appendChild(addressWrapper)

                elmContainer.append(unbondDelElm)

                currDelgs[delAddr].push(valAddr)
            }
            else {
                // Only update entries
                document.querySelector(`.unbonding-delegation-item[data-address-sender="${delAddr}"][data-address-recipient="${valAddr}"] .unbond-entries`).innerHTML = updateEntries(unbondDel.entries)
            }
        })
    }
}

function updateEntries(entries) {
    let containerElm = document.createElement('div')

    // Always update entries
    entries.forEach(function(entry){
        let unbondEntry = document.createElement('div')

        let unbondAmount = document.createElement('div')
        unbondAmount.classList.add('unbond-amount')
        unbondAmount.innerHTML = numeral(conversion.ustanToStan(entry.balance)).format('0,0[.]00') + 'stan'

        let complTime = document.createElement('div')
        complTime.classList.add('completion-time')
        let ms = Date.parse(entry.completion_time)
        let date = new Date(ms)
        complTime.innerHTML = date.toString('dd/MM/yyyy H:mm')

        unbondEntry.append(unbondAmount)
        unbondEntry.append(complTime)

        containerElm.append(unbondEntry)
    })

    return containerElm.innerHTML
}

module.exports = {
    init: function () {
        init()
    }
};