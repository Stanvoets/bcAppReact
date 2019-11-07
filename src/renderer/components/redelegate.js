let popup = document.getElementById('redelegate')
let form = document.getElementById('form--redelegate')
let errMsgElm = form.querySelector('.err-msg')
const popups = require('../popup')

function init() {
    popups.checkForPopupsToLoad()

    let pwdConfirmPopup = document.getElementById('password-confirm--redelegate')

    form.addEventListener('submit',(e) => {
        e.preventDefault()
        errMsgElm.innerHTML = ''

        // Get form values
        let valAddr = form.querySelector('.form-item--address input').value
        let amount = form.querySelector('.form-item--amount input').value

        // Error checking
        let errMsg = ''
        if (valAddr.substr(0, 13) !== "bitcnavaloper") {
            errMsg = 'Address should start with "bitcnavaloper"'
        }
        if (valAddr.length !== 52) {
            errMsg = 'Validator address should be exactly 52 characters.'
        }
        if (!valAddr.match(/^[a-z0-9]+$/i)) {
            errMsg = 'Address contians characters that aren\'t allowed.'
        }
        if (errMsg) {
            errMsgElm.innerHTML = `<p>${errMsg}</p>`
            return false
        }

        // Open popup if form valid
        if (form.checkValidity()) {
            // Populate tx summary
            let txSummary = pwdConfirmPopup.querySelector('.tx-summary')
            txSummary.querySelector('.del-addr').innerHTML = popup.keyLabel
            txSummary.querySelector('.val-addr').innerHTML = valAddr
            txSummary.querySelector('.amount').innerHTML = amount

            pwdConfirmPopup.delAddr = popup.delAddr
            pwdConfirmPopup.oldValAddr = popup.oldValAddr
            pwdConfirmPopup.valAddr = valAddr
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