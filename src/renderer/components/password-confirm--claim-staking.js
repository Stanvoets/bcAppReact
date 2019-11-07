const { ipcRenderer } = require('electron')
let confirmPassPopupD = document.getElementById('password-confirm--claim-staking')
let submitBtn = confirmPassPopupD.querySelector('.form-submit')
let confirmPassForm = document.getElementById('form--password-confirm--claim-staking')
let errMsgElm = document.querySelector('#delegate .err-msg')
let sucsMsgElm = document.querySelector('#delegate .sucs-msg')

function init() {
    // Add form listeners
    confirmPassForm.addEventListener('submit', function(e){
        e.preventDefault()
    })
    confirmPassForm.addEventListener('submit', claimStakingTxFormSubmit)

    // Allow form to be submitted again.
    ipcRenderer.on('claimed-staking-rewards', (e ,resp) => {
        submitBtn.classList.remove('disabled')
        confirmPassForm.addEventListener('submit', claimStakingTxFormSubmit)
        console.log('RESP')
        console.log(resp)

        if (resp === true) {
            confirmPassPopupD.classList.remove('is-shown')
            sucsMsgElm.innerHTML = 'Claimed rewards!'
        }
    })
}


function claimStakingTxFormSubmit(){
    // Disbale submit button
    submitBtn.classList.add('disabled')
    confirmPassForm.removeEventListener('submit', claimStakingTxFormSubmit)

    let password = confirmPassForm.querySelector('.form-item--password input').value

    // Process tx
    ipcRenderer.send('claim-staking-rewards', password)
}

module.exports = {
    init: function () {
        init()
    }
};