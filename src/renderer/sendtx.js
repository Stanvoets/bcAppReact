const kvStore = require('../storage/main')
const { ipcRenderer } = require('electron')
const addressBook = new kvStore({name: 'address-book'})


function init() {
    let confirmPassPopup = document.getElementById('password-confirm')
    let sendTxSubmit = document.querySelector('#password-confirm  .form-submit')
    let form = document.getElementById('form--send-tx')
    let addressInput = document.querySelector(`#${form.id} .form-item--address input`)
    let errMsgElm = form.querySelector('.err-msg')
    let sucsMsgElm = form.querySelector('.sucs-msg')
    let amountInput = document.getElementById("amount")
    let addrAnnotation = document.querySelector('form .address-book-annotation')

    // Recieve auth data
    ipcRenderer.on('send-tx', (event, resp) => {
        // Close popup
        confirmPassPopup.classList.remove('is-shown')

        // Success
        if (resp === true) {
            form.reset()
            addrAnnotation.innerHTML = ''
            sucsMsgElm.innerHTML = '<p>Your transaction was successfully send!</p>'
        }
        // Error
        else {
            let errMsg = 'Something went wrong sending your transaction.'

            if (resp === 'invalid-password') {
                // Set err msg on the popup form
                // errMsgElm = document.querySelector(`#${confirmPassForm.id} .err-msg`)
                errMsg = 'The password you entered was incorrect!'
            }

            if (resp === 'not-enough-funds') {
                errMsg = 'You dont\'t have enough coins on this address at the moment, please make sure your coins available or choose another address.'
            }

            if (resp === 'unknown') {
                errMsg = 'An unknown error ocurred.'
            }

            errMsgElm.innerHTML = `<p>${errMsg}</p>`
        }
    })

    // On Btn click
    form.addEventListener('submit', function(e){
        e.preventDefault()

        let address = addressInput.value
        let amount = amountInput.value

        let errMsg = ''
        if (address.substr(0, 6) !== "bitcna") {
            errMsg = 'Address should start with "bitcna"'
        }
        if (address.length !== 45) {
            errMsg = 'Address should be exactly 45 characters.'
        }
        if (!address.match(/^[a-z0-9]+$/i)) {
            errMsg = 'Address contians characters that aren\'t allowed.'
        }
        if (errMsg) {
            errMsgElm.innerHTML = `<p>${errMsg}</p>`
            return false
        }

        // Populate password confirm popup with tx summary
        document.querySelector(`#password-confirm .tx-summary .address`).innerHTML = addressBook.getAddrBookAddressLabel(address)
        document.querySelector(`#password-confirm .tx-summary .amount`).innerHTML = amount + ' stan'

        // Open popup if no form errs
        if (form.checkValidity()) {
            confirmPassPopup.classList.add('is-shown')
        }
    })

    // Check if address input is known in addressbook
    addressInput.addEventListener('keyup', function(){
        let label = addressBook.getAddrBookAddressLabel(addressInput.value)
        if (label !== addressInput.value) {
            addrAnnotation.innerHTML = label
        }
        else {
            addrAnnotation.innerHTML = ''
        }
    })
}

export default {
    init: function () {
        init()
    }
}