let popup = document.getElementById('unbond')
let form = document.getElementById('form--unbond')
let errMsgElm = form.querySelector('.err-msg')
const popups = require('../popup')

function init() {
    popups.checkForPopupsToLoad()

    let pwdConfirmPopup = document.getElementById('password-confirm--unbond')

    form.addEventListener('submit',(e) => {
        e.preventDefault()
        errMsgElm.innerHTML = ''

        // Open popup if form valid
        if (form.checkValidity()) {
            let amount  = form.querySelector('.form-item--amount input').value
            // Populate tx summary
            let txSummary = pwdConfirmPopup.querySelector('.tx-summary')
            txSummary.querySelector('.del-addr').innerHTML = popup.keyLabel
            txSummary.querySelector('.val-addr').innerHTML = popup.valAddr
            txSummary.querySelector('.amount').innerHTML = amount

            pwdConfirmPopup.delAddr = popup.delAddr
            pwdConfirmPopup.valAddr = popup.valAddr
            pwdConfirmPopup.amount = amount
            pwdConfirmPopup.classList.add('is-shown')
        }
    })
}

module.exports = {
    init: function () {
        init()
    }
};