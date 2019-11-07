let confirmPassPopup = document.getElementById('password-confirm--claim-delegation-reward')
let submitBtn = confirmPassPopup.querySelector('.form-submit')
let confirmPassForm = document.getElementById('form--password-confirm--claim-delegation-reward')
let sucsMsgElm = document.querySelector('#delegate .sucs-msg')
const kvStore = require('../../storage/main')
const { ipcRenderer } = require('electron')

function init() {
    // Add form listeners
    confirmPassForm.addEventListener('submit', function(e){
        e.preventDefault()
    })
    confirmPassForm.addEventListener('submit', claimDelegationTxFormSubmit)

    // Allow form to be submitted again.
    ipcRenderer.on('claimed-delegation-reward', () => {
        submitBtn.classList.remove('disabled')
        confirmPassForm.addEventListener('submit', claimDelegationTxFormSubmit)

        confirmPassPopup.classList.remove('is-shown')
        sucsMsgElm.innerHTML = 'Claimed rewards!'
    })
}


function claimDelegationTxFormSubmit(){
    // Disbale submit button
    submitBtn.classList.add('disabled')
    confirmPassForm.removeEventListener('submit', claimDelegationTxFormSubmit)

    let pwd = confirmPassForm.querySelector('.form-item--password input').value
    let del = new kvStore({name: 'staking'}).getDelegation(confirmPassPopup.delAddr, confirmPassPopup.valAddr)
    ipcRenderer.send('claim-delegation-reward', pwd, del)
}

module.exports = {
    init: function () {
        init()
    }
};