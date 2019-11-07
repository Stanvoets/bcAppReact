let confirmPassForm = document.getElementById('form--password-confirm')
const { ipcRenderer } = require('electron')
let sendTxSubmit = document.querySelector('#password-confirm  .form-submit')
let form = document.getElementById('form--send-tx')
let sucsMsgElm = form.querySelector('.sucs-msg')
let errMsgElm = form.querySelector('.err-msg')

function init() {
    // Add form listeners
    confirmPassForm.addEventListener('submit', function(e){
        e.preventDefault()
    })
    confirmPassForm.addEventListener('submit', sendTxFormSubmit)

    // Allow form to be submitted again.
    ipcRenderer.on('send-tx', (event, resp) => {
        sendTxSubmit.classList.remove('disabled')
        confirmPassForm.addEventListener('submit', sendTxFormSubmit)
    })
}

function sendTxFormSubmit(){
    // Reset msgs
    sucsMsgElm.innerHTML = ''
    errMsgElm.innerHTML = ''

    // Disbale submit button
    sendTxSubmit.classList.add('disabled')
    confirmPassForm.removeEventListener('submit', sendTxFormSubmit)

    let address = form.querySelector('.form-item--address input').value
    let amount = form.querySelector('.form-item--amount input').value
    let password = confirmPassForm.querySelector('.form-item--password input').value

    // Process tx
    ipcRenderer.send('send-tx', [address, amount, password])
}

module.exports = {
    init: function () {
        init()
    }
}