const numeral = require('numeral')
let hashes = []
const { ipcRenderer } = require('electron')
const kvStore = require('../../storage/main')
const walletStore = new kvStore({name: 'auth'})

function init() {
    ipcRenderer.send('load-addresses')

    ipcRenderer.on('loaded-addresses', function(event, resp){
        // Set values in dom
        setComponentValues(resp)
    })

    ipcRenderer.on('deleted-key', function(){
        ipcRenderer.send('load-addresses')
    })

    // rm button
    document.querySelector('.address-manager-action--rm').addEventListener('click', function(){
        let label = document.querySelector('#address-manager .address-item.item-selected .name').innerHTML
        ipcRenderer.send('delete-key', label)
    })
}
function setComponentValues(addresses){
    let addressElmContainer = document.getElementById('address-manager-inner')
    let addressElm

    addresses.sort(function(a, b){
        let nameA = a.name
        let nameB = b.name

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        return 0;
    });

    addresses.forEach(function (addr) {
        // If address is already loaded; only update it
        if (!hashes.includes(addr.address)) {
            // Create tx item
            addressElm = document.createElement('div')
            addressElm.setAttribute('data-address', addr.address)
            addressElm.classList.add('address-item')
            addressElm.classList.add('sh-block')

            let name = addr.name
            name = document.createTextNode(name)
            let nameDiv = document.createElement('div')
            nameDiv.classList.add('name')
            nameDiv.appendChild(name)

            let address = addr.address
            address = document.createTextNode(address)
            let addressDiv = document.createElement('div')
            addressDiv.classList.add('address')
            addressDiv.appendChild(address)

            let actionsContainer = document.createElement('div')
            actionsContainer.classList.add('actions-container')

            let moreBtn = document.createElement('div')
            moreBtn.classList.add('trigger-actions')
            moreBtn.classList.add('icon-btn')
            moreBtn.classList.add('icon-arr-down')

            let actions = document.createElement('div')
            actions.classList.add('action-items')
            actions.classList.add('sh-block')

            let actionSetDefault = document.createElement('div')
            actionSetDefault.classList.add('action-item--set-default')
            actionSetDefault.classList.add('action-item')
            actionSetDefault.innerHTML = 'Set default'

            actionsContainer.append(moreBtn)
            actionsContainer.append(actions)
            actions.append(actionSetDefault)

            let labelContainer = document.createElement('div')
            labelContainer.classList.add('address-container')
            labelContainer.appendChild(nameDiv)
            labelContainer.appendChild(addressDiv)

            addressElm.appendChild(labelContainer)


            let coinsAmountDiv = document.createElement('span')
            coinsAmountDiv.classList.add('amount')

            let coinsDenomDiv = document.createElement('span')
            coinsDenomDiv.classList.add('denom')

            let coinsDiv = document.createElement('div')
            coinsDiv.classList.add('coins')

            let coinContainer = document.createElement('div')
            coinContainer.classList.add('coin-container')

            let fiatDiv = document.createElement('span')
            fiatDiv.classList.add('fiat')

            // If funds available for address
            if (addr.coins !== undefined) {
                coinsAmountDiv.append(numeral(addr.coins[0].amount).format('0,0[.]00'))
                coinsDenomDiv.append('stan')
                fiatDiv.append('$' + numeral(addr.fiat).format('0,0[.]00'))
            }

            // Append values to divs
            coinsDiv.append(coinsAmountDiv)
            coinsDiv.append(coinsDenomDiv)
            coinContainer.append(coinsDiv)
            addressElm.appendChild(coinContainer)
            coinContainer.append(fiatDiv)

            addressElm.appendChild(actionsContainer)

            addressElmContainer.append(addressElm)

            hashes.push(addr.address)

            // Active state
            let triggerActionsBtn = addressElm.querySelector('.trigger-actions')
            let c = 'open'

            triggerActionsBtn.addEventListener('click', function(){
                let active = triggerActionsBtn.parentElement.classList.contains(c)

                document.querySelectorAll('#address-manager .address-item .trigger-actions').forEach(function(triggerActionsBtn){
                    triggerActionsBtn.parentElement.classList.remove(c)
                })

                if (!active) {
                    triggerActionsBtn.parentElement.classList.add(c)
                }
            })

            // Actions
            addressElm.querySelectorAll('.action-item').forEach(function(elm){
                elm.addEventListener('click', function(){
                    if (elm.classList.contains('action-item--set-default')) {
                        // @TODO improve parent selector method
                        let address = elm.parentElement.parentElement.parentElement.getAttribute('data-address')
                        walletStore.setAddress(address)
                        triggerActionsBtn.parentElement.classList.remove(c)
                    }
                })
            })

            // @TODO improve to fire only once per click (not for every element)
            document.body.addEventListener('click', function(e){
                if (!e.target.classList.contains('trigger-actions') && !e.target.classList.contains('action-items') ) {
                    if (triggerActionsBtn.parentElement.classList.contains(c)) {
                        triggerActionsBtn.parentElement.classList.remove(c)
                    }
                }
            })
        }
        // Update
        else {
            if (addr.coins !== undefined) {
                // Get existing item
                let addressElm = document.querySelector(`div[data-address="${addr.address}"]`)
                addressElm.querySelector('.fiat').innerHTML = '$' + numeral(addr.fiat).format('0,0[.]00')
                addressElm.querySelector('.coins .amount').innerHTML = numeral(addr.coins[0].amount).format('0,0[.]00')
            }
        }
    })
}

module.exports = {
    init: function () {
        init()
    }
};