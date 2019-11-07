let confirmPassPopup = document.getElementById('password-confirm--unbond')
let submitBtn = confirmPassPopup.querySelector('.form-submit')
let confirmPassForm = document.getElementById('form--password-confirm--unbond')
let sucsMsgElm = document.querySelector('#delegate .sucs-msg')
const kvStore = require('../../storage/main')
const { ipcRenderer } = require('electron')

function init() {
    // Add form listeners
    confirmPassForm.addEventListener('submit', function(e){
        e.preventDefault()
    })
    confirmPassForm.addEventListener('submit', unbondTxFormSubmit)

    // Allow form to be submitted again.
    ipcRenderer.on('unbonded', () => {
        submitBtn.classList.remove('disabled')
        confirmPassForm.addEventListener('submit', unbondTxFormSubmit)

        confirmPassPopup.classList.remove('is-shown')
        document.getElementById('unbond').classList.remove('is-shown')
        sucsMsgElm.innerHTML = 'Unbonded successfully!'
    })
}


function unbondTxFormSubmit(){
    // Disbale submit button
    submitBtn.classList.add('disabled')
    confirmPassForm.removeEventListener('submit', unbondTxFormSubmit)

    let pwd = confirmPassForm.querySelector('.form-item--password input').value
    let delAddr = confirmPassPopup.delAddr
    let valAddr = confirmPassPopup.valAddr
    let amount = confirmPassPopup.amount

    let del = new kvStore({name: 'staking'}).getDelegation(delAddr, valAddr)
    ipcRenderer.send('unbond', pwd, del, amount)
}

module.exports = {
    init: function () {
        init()
    }
};