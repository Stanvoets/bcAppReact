let confirmPassPopupD = document.getElementById('password-confirm--delegate')
let formD = document.getElementById('form--delegate-tx')
let delSelect = formD.querySelector(".form-item--delegator select")
let addressInputD = formD.querySelector('.form-item--address input')
let errMsgElmD = formD.querySelector('.err-msg')
let amountInputD = formD.querySelector(".amount")
const kvStore = require('../../storage/main')
const addressCache = new kvStore({name: 'address-cache'})
// import popups from '../popup'

function init(){

    // popups.checkForPopupsToLoad()

    let addresses = addressCache.loadAddresses()
    if (addresses.length) {
        addresses.forEach(function(addr){
            // Load addresses for delegator select box.
            let option = document.createElement('option')
            option.setAttribute('value', addr.address)
            option.innerHTML = addr.name
            delSelect.append(option)
        })
    }

    // On Btn click
    formD.addEventListener('submit', function(e){
        e.preventDefault()

        let valAddr = addressInputD.value
        let err = false
        let errMsg
        if (valAddr.length !== 52) {
            err = true
            errMsg = 'Address should be exactly 52 characters long.'
        }
        if (valAddr.substr(0, 13) !== "bitcnavaloper") {
            err = true
            errMsg = 'The validator address should start with "bitcnavalconspub".'
        }
        if (!valAddr.match(/^[a-z0-9]+$/i)) {
            err = true
            errMsg = 'The validator address contians characters that aren\'t allowed.'
        }
        if (err) {
            errMsgElmD.innerHTML = `<p>${errMsg}</p>`
            return false
        }


        if (formD.checkValidity()) {
            // Open popup if no form errs
            // Populate password confirm popup with tx summary]
            let amount = amountInputD.value

            confirmPassPopupD.querySelector('.tx-summary .label').innerHTML = delSelect.options[delSelect.selectedIndex].text
            confirmPassPopupD.querySelector('.tx-summary .address').innerHTML = valAddr
            confirmPassPopupD.querySelector('.tx-summary .amount').innerHTML = amount + ' stan'

            confirmPassPopupD.delAddr = delSelect.value
            confirmPassPopupD.valAddr = valAddr
            confirmPassPopupD.amount = amount

            confirmPassPopupD.classList.add('is-shown')
        }
    });
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