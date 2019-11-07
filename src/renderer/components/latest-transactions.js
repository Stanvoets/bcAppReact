require('datejs')
const { ipcRenderer } = require('electron')
const conversion  = require('../../bank/conversion')
let txElmContainer = document.getElementById('latest-transactions-inner')
let i = 0
let limit = 9
let txHashes = []
const kvStore = require('../../storage/main')
const addressBook = new kvStore({name: 'address-book'})

function init(){
    // Load from cache
    let txs = new kvStore({name: 'tx-cache'}).getTxs()
    if (txs.length) {
        setComponentValues(txs)
    }

    ipcRenderer.on('loaded-txs', function(event, resp){
        setComponentValues(resp)
    })
}

function setComponentValues(txs){
    let txElm
    txs.forEach(function(tx){
        // Prevent duplicates
        if (!txHashes.includes(tx.txhash)) {
            i++

            // Create tx item
            txElm = document.createElement('div')
            txElm.classList.add('tx-item')
            txElm.classList.add('tx-item-'+i)

            let address
            if (tx.incoming !== undefined && tx.incoming) {
                txElm.classList.add('tx-recieved')
                address = tx.tx.value.msg[0].value.from_address
            }
            else {
                address = tx.tx.value.msg[0].value.to_address
            }

            let amount = conversion.ustanToStan(tx.tx.value.msg[0].value.amount[0].amount)
            amount = document.createTextNode(amount)
            let amountDiv = document.createElement('div')
            amountDiv.classList.add('amount')
            amountDiv.appendChild(amount)

            // @TODO address label lookup
            address = tx.height + ' --- ' + addressBook.getAddrBookAddressLabel(address)
            address = document.createTextNode(address)
            let addressDiv = document.createElement('div')
            addressDiv.classList.add('address')
            addressDiv.appendChild(address)

            let ms = Date.parse(tx.timestamp)
            let date = new Date(ms)
            date = date.toString('dd/MM/yyyy H:mm:ss')
            date = document.createTextNode(date)
            let dateDiv = document.createElement('div')
            dateDiv.classList.add('date')
            dateDiv.appendChild(date)

            let addrDateWrapper = document.createElement('div')
            addrDateWrapper.classList.add('address-date-wrapper')
            addrDateWrapper.appendChild(addressDiv)
            addrDateWrapper.appendChild(dateDiv)

            txElm.appendChild(addrDateWrapper)
            txElm.appendChild(amountDiv)

            // Add tx item to tx container
            txElmContainer.prepend(txElm)

            // Remove last tx in list
            if (i > limit) {
                txElmContainer.removeChild(txElmContainer.lastChild);
            }

            // Keep track of shown txs (so we know which ones are new)
            txHashes.push(tx.txhash)
        }
    })
}

module.exports = {
    init: function () {
        init()
    }
};