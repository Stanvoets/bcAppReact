let popup = document.getElementById('password-confirm--delegate')
let delegateTxSubmit = popup.querySelector('.form-submit')
let confirmPassForm = document.getElementById('form--password-confirm--delegate')
const { ipcRenderer } = require('electron')
let sucsMsgElm = document.querySelector('#delegate .sucs-msg')
let errMsgElm = document.querySelector('#delegate .err-msg')

function init() {
    // Add form listeners
    confirmPassForm.addEventListener('submit', function(e){
        e.preventDefault()
    })
    confirmPassForm.addEventListener('submit', delegateTxFormSubmit)
}

// Allow form to be submitted again.
ipcRenderer.on('delegated', () => {
    delegateTxSubmit.classList.remove('disabled')
    confirmPassForm.addEventListener('submit', delegateTxFormSubmit)
})

function delegateTxFormSubmit(){
    // Reset msgs
    sucsMsgElm.innerHTML = ''
    errMsgElm.innerHTML = ''

    // Disbale submit button
    delegateTxSubmit.classList.add('disabled')
    confirmPassForm.removeEventListener('submit', delegateTxFormSubmit)

    let password = confirmPassForm.querySelector('.form-item--password input').value

    // Process tx
    ipcRenderer.send('delegate-tx', popup.delAddr, popup.valAddr, popup.amount, password)
}

module.exports = {
    init: function () {
        init()
    }
};