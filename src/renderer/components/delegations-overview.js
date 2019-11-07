const { ipcRenderer } = require('electron')
const numeral = require('numeral')
let currDelgs = []
const kvStore = require('../../storage/main')
const addressCache = new kvStore({name: 'address-cache'})
let sucsMsgElm = document.querySelector('#delegate .sucs-msg')
let errMsgElm = document.querySelector('#delegate .err-msg')
const popups = require('../popup')

function init() {
    // Load delegations from cache first
    let dels = new kvStore({name: 'staking'}).getDelegations()
    if (dels.length) {
        setComponentValues(dels)
    }

    ipcRenderer.send('load-delegations')

    ipcRenderer.on('loaded-delegations', function(e, resp){
        // Set values in dom
        setComponentValues(resp)
    });

    ipcRenderer.on('loaded-delegation-reward', function(event, coins, delAddr, valAddr){
        document.querySelectorAll(`div[data-address-sender="${delAddr}"][data-address-recipient="${valAddr}"]`).forEach(function(elm){
            // @TODO fix - check if defined shoudn't be needed
            if (elm.querySelector('.unclaimed-rewards') !== null) {
                elm.querySelector('.unclaimed-rewards').innerHTML = `<span class="amount">${coins}</span> stan unclaimed`;
            }
        })
    })

    // Recieve auth data
    ipcRenderer.on('unbonded', (event, resp) => {
        popups.closePopups()

        if (resp === true) {
            sucsMsgElm.innerHTML = '<p>Unbonded!</p>'
        }
    })

    ipcRenderer.on('delegated', (event, resp) => {
        popups.closePopups()

        if (resp === true) {
            sucsMsgElm.innerHTML = '<p>Delegated!</p>'
        }

        let errMsg = '';

        if (resp === 'invalid-password') {
            errMsg = 'The password you entered was incorrect!'
        }

        if (resp === 'gas') {
            errMsg = 'You dont\'t have enough funds to pay for the gas at the moment, read more about gas here'
        }

        if (resp === 'not-enough-funds') {
            errMsg = 'You dont\'t have enough funds on this address at the moment, please make sure you have enough funds or choose another address to send from.'
        }

        if (resp === 'unknown') {
            errMsg = 'An unknown error ocurred.'
        }

        if (errMsg.length) {
            errMsgElm.innerHTML = `<p>${errMsg}</p>`;
        }
    })
}

function setComponentValues(delegations){
    let delegationElm

    delegations.forEach(function (delegation) {
        let keyLabel = delegation.key_label
        let delAddr = delegation.delegator_address
        let valAddr = delegation.validator_address

        // Init array with current del
        if(currDelgs[delAddr] === undefined) {
            currDelgs[delAddr] = []
        }

        if (!currDelgs[delAddr].includes(valAddr)) {
            // Create delegation
            delegationElm = document.createElement('div')
            delegationElm.setAttribute('data-key-label', keyLabel)
            delegationElm.setAttribute('data-address-sender', delAddr)
            delegationElm.setAttribute('data-address-recipient', valAddr)
            delegationElm.classList.add('delegation-item')
            delegationElm.classList.add('sh-block')

            let delLabel = addressCache.getAddressLabel(delAddr)
            delLabel = document.createTextNode(delLabel)
            let delLabelDiv = document.createElement('div')
            delLabelDiv.classList.add('sender')
            delLabelDiv.appendChild(delLabel)

            let address = document.createTextNode(valAddr)
            let addressDiv = document.createElement('div')
            addressDiv.classList.add('recipient')
            addressDiv.appendChild(address)

            let coinsDiv = document.createElement('span')
            coinsDiv.classList.add('amount')
            coinsDiv.append(numeral(delegation.shares).format('0,0[.]00') + 'stan')

            let addressWrapper = document.createElement('div')
            addressWrapper.classList.add('address-wrapper')
            addressWrapper.appendChild(delLabelDiv)
            addressWrapper.appendChild(addressDiv)

            let rewardsWrapper = document.createElement('div')
            rewardsWrapper.classList.add('unclaimed-rewards')
            if (delegation.unclaimed_coins) {
                rewardsWrapper.innerHTML = `${delegation.unclaimed_coins} stan unclaimed`
            }

            let actionsContainer = document.createElement('div')
            actionsContainer.classList.add('actions-container')

            let moreBtn = document.createElement('div')
            moreBtn.classList.add('trigger-actions')
            moreBtn.classList.add('icon-btn')
            moreBtn.classList.add('icon-arr-down')

            let actions = document.createElement('div')
            actions.classList.add('action-items')
            actions.classList.add('sh-block')

            let claimButton = document.createElement('div')
            claimButton.classList.add('action-item--claim-reward')
            claimButton.classList.add('action-item')
            claimButton.classList.add('popup-trigger')
            claimButton.classList.add('popup-trigger-custom-handler')
            claimButton.classList.add('popup-trigger--password-confirm--claim-delegation-reward')
            claimButton.setAttribute('stan-popup', 'password-confirm--claim-delegation-reward')
            claimButton.innerHTML = 'Claim reward'

            let redelButton = document.createElement('div')
            redelButton.classList.add('action-item--redelegate')
            redelButton.classList.add('action-item')
            redelButton.classList.add('popup-trigger')
            redelButton.classList.add('popup-trigger--redelegate')
            redelButton.setAttribute('stan-popup', 'redelegate')
            redelButton.innerHTML = 'Redelegate'

            let unbondButton = document.createElement('div')
            unbondButton.classList.add('action-item--unbond')
            unbondButton.classList.add('action-item')
            unbondButton.classList.add('popup-trigger')
            unbondButton.classList.add('popup-trigger--unbond')
            unbondButton.setAttribute('stan-popup', 'unbond')
            unbondButton.innerHTML = 'Unbond'

            let incStakeButton = document.createElement('div')
            incStakeButton.classList.add('action-item--increase-stake')
            incStakeButton.classList.add('action-item')
            incStakeButton.classList.add('popup-trigger')
            incStakeButton.classList.add('popup-trigger--increase-stake')
            incStakeButton.setAttribute('stan-popup', 'increase-stake')
            incStakeButton.innerHTML = 'Increase stake'

            actionsContainer.append(moreBtn)
            actionsContainer.append(actions)
            actions.append(claimButton)
            actions.append(incStakeButton)
            actions.append(redelButton)
            actions.append(unbondButton)

            delegationElm.appendChild(addressWrapper)
            delegationElm.appendChild(coinsDiv)
            delegationElm.appendChild(rewardsWrapper)
            delegationElm.appendChild(actionsContainer)

            document.getElementById('delegations-overview-inner').append(delegationElm)

            currDelgs[delAddr].push(valAddr)

            // Active state
            let triggerActionsBtn = delegationElm.querySelector('.trigger-actions')
            let c = 'open'

            document.body.addEventListener('click', function(e){
                if (!e.target.classList.contains('trigger-actions') && !e.target.classList.contains('action-items') ) {
                    if (triggerActionsBtn.parentElement.classList.contains(c)) {
                        triggerActionsBtn.parentElement.classList.remove(c)
                    }
                }
            })

            triggerActionsBtn.addEventListener('click', function(){
                let active = triggerActionsBtn.parentElement.classList.contains(c)

                document.querySelectorAll('#delegations-overview .delegation-item .trigger-actions').forEach(function(triggerActionsBtn){
                    triggerActionsBtn.parentElement.classList.remove(c)
                })

                if (!active) {
                    triggerActionsBtn.parentElement.classList.add(c)
                }
            })

            // Actions
            delegationElm.querySelectorAll('.action-item').forEach(function(elm){
                elm.addEventListener('click', function(){
                    let delAddr = elm.parentElement.parentElement.parentElement.getAttribute('data-address-sender')
                    let popup
                    if (elm.classList.contains('action-item--claim-reward')) {
                        let amount = elm.parentElement.parentElement.parentElement.querySelector('.unclaimed-rewards .amount').innerHTML

                        popup = document.getElementById('password-confirm--claim-delegation-reward')

                        // Populate summary
                        popup.querySelector('.tx-summary .sender').innerHTML = keyLabel
                        popup.querySelector('.tx-summary .recipient').innerHTML = valAddr
                        popup.querySelector('.tx-summary .claim-amount').innerHTML = `Claim your reward of ${amount} stan?`

                        // Show popup
                        popup.classList.add('is-shown')
                    }
                    if (elm.classList.contains('action-item--redelegate')) {
                        popup = document.getElementById('redelegate')
                        popup.oldValAddr = valAddr
                    }
                    if (elm.classList.contains('action-item--unbond')) {
                        popup = document.getElementById('unbond')
                    }
                    if (elm.classList.contains('action-item--increase-stake')) {
                        popup = document.getElementById('increase-stake')
                    }
                    popup.keyLabel = keyLabel
                    popup.delAddr = delAddr
                    popup.valAddr = valAddr
                })
            })
        }
        else {
            let delegationItem = document.querySelector(`.delegation-item[data-address-sender="${delegation.delegator_address}"][data-address-recipient="${delegation.validator_address}"]`)
            delegationItem.querySelector('.amount').innerHTML = numeral(delegation.shares).format('0,0[.]00') + 'stan'
        }
    })
}

module.exports = {
    init: function () {
        init()
    }
};