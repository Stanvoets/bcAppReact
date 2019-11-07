
let popup = document.getElementById('increase-stake')
let confirmPassPopup = document.getElementById('password-confirm--delegate')
let form = document.getElementById('form--increase-stake-tx')
let errMsgElm = form.querySelector('.err-msg')
let sucsMsgElm = document.querySelector('#delegate .sucs-msg')
let amountInput = form.querySelector(".amount")
const popups = require('../popup')

function init(){
    popups.checkForPopupsToLoad()

    // On Btn click
    form.addEventListener('submit', function(e){
        e.preventDefault()

        // Populate password confirm popup with tx summary
        confirmPassPopup.querySelector('.tx-summary .label').innerHTML = popup.keyLabel
        confirmPassPopup.querySelector('.tx-summary .address').innerHTML = popup.valAddr
        confirmPassPopup.querySelector('.tx-summary .amount').innerHTML = amountInput.value + ' stan'

        confirmPassPopup.delAddr = popup.delAddr
        confirmPassPopup.valAddr = popup.valAddr
        confirmPassPopup.amount = amountInput.value

        // Open popup if no form errs
        if (form.checkValidity()) {
            confirmPassPopup.classList.add('is-shown')
        }
    })
}

// // Check if address input is known in addressbook
// addressInputD.addEventListener('keyup', function(){
//     document.querySelector('form .address-book-annotation').innerHTML = addressBook.getAddressLabel(addressInputD.value)
// })

module.exports = {
    init: function () {
        init()
    }
};