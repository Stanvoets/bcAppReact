const { ipcRenderer } = require('electron')

let form = document.getElementById('auth-form--sign-in')
let label = document.querySelector(`#${form.id} .form-item--label input`)
let submitBtn = document.querySelector(`#${form.id} .form-submit`)
let errMsgElm = document.querySelector('.err-msg')
let sucsMsgElm = document.querySelector('.sucs-msg')

// Recieve auth data
ipcRenderer.on('unlockPrivateKey', (event, data) => {
    // Error checking
    if (data === false) {
        let errMsg = document.querySelector('.err-msg')
        errMsg.innerHTML = '<p>The password you entered was incorrect!</p>'

        // Allow form to be submitted again.
        submitBtn.classList.remove('disabled')
        submitBtn.addEventListener('click', function(e){
            let event = new Event('submit');
            form.dispatchEvent(event)
        })
    }
    // Success
    else {
        // Open main app in new window
        console.log('Load main app')
        ipcRenderer.send('load-main-app')
    }
})

// Add form listeners
form.addEventListener('submit', function(e){
    e.preventDefault()
})
form.addEventListener('submit', submitForm)

function submitForm(){
    // Reset msgs
    sucsMsgElm.innerHTML = ''
    errMsgElm.innerHTML = ''

    // Disbale submit button
    submitBtn.classList.add('disabled')
    form.removeEventListener('submit', submitForm)

    let password = document.querySelector(`#${form.id} .form-item--password input`).value
    ipcRenderer.send('unlockPrivKeysubmitForm', [label.value, password])
}