let confirmPassPopup = document.getElementById('password-confirm--redelegate')
let submitBtn = confirmPassPopup.querySelector('.form-submit')
let confirmPassForm = document.getElementById('form--password-confirm--redelegate')
let sucsMsgElm = document.querySelector('#delegate .sucs-msg')
const kvStore = require('../../storage/main')
const { ipcRenderer } = require('electron')

function init() {
    // Add form listeners
    confirmPassForm.addEventListener('submit', function(e){
        e.preventDefault()
    })
    confirmPassForm.addEventListener('submit', redelegateTxFormSubmit)

    // Allow form to be submitted again.
    ipcRenderer.on('redelegated', () => {
        submitBtn.classList.remove('disabled')
        confirmPassForm.addEventListener('submit', redelegateTxFormSubmit)

        confirmPassPopup.classList.remove('is-shown')
        document.getElementById('redelegate').classList.remove('is-shown')
        sucsMsgElm.innerHTML = 'Redelegated successfully!'
    })
}


function redelegateTxFormSubmit(){
    // Disbale submit button
    submitBtn.classList.add('disabled')
    confirmPassForm.removeEventListener('submit', redelegateTxFormSubmit)

    let pwd = confirmPassForm.querySelector('.form-item--password input').value
    let delAddr = confirmPassPopup.delAddr
    let valAddr = confirmPassPopup.valAddr
    let oldValAddr = confirmPassPopup.oldValAddr
    let amount = confirmPassPopup.amount

    let del = new kvStore({name: 'staking'}).getDelegation(delAddr, oldValAddr)
    ipcRenderer.send('redelegate', pwd, del, valAddr, amount)
}

module.exports = {
    init: function () {
        init()
    }
};