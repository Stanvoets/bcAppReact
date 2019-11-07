const { ipcRenderer } = require('electron')
const anime = require('animejs')
let cWForm = document.querySelector("#auth-form--create-wallet")
let cWLabel = document.querySelector(`#${cWForm.id} .form-item--label input`)
let cWSubmitBtn = document.querySelector(`#${cWForm.id} .form-submit`)

// Recieve auth data
ipcRenderer.on('created-key', (event, data) => {
    // Error checking
    if (data === 'err_label_duplicate') {
        let errMsg = document.createElement('div')
        errMsg.classList.add('err-msg')
        errMsg.innerHTML = 'This label is already being used on this device!'
        cWForm.prepend(errMsg)

        // Allow cWForm to be submitted again.
        console.log(cWSubmitBtn)
        cWSubmitBtn.classList.remove('disabled')
        cWSubmitBtn.addEventListener('click', function(e){
            let event = new Event('submit');
            cWForm.dispatchEvent(event)
        })
    }
    // Success
    else {
        let confirmationContainer = document.querySelector('#confirmation-message-container')
        confirmationContainer.style.display = 'inline-block'
        let phraseDiv = document.querySelector('#confirmation-message-container .phrase-value')
        let labelDiv = document.querySelector('#confirmation-message-container .label-value')
        labelDiv.innerHTML = cWLabel.value
        phraseDiv.innerHTML = data

        anime({
            targets: '#create-wallet form, #create-wallet #confirmation-message-container',
            translateX: -855,
            duration: 2400,
            easing: 'spring'
        })
    }
})

// Add cWForm listeners
cWForm.addEventListener('submit', function(e){
    e.preventDefault()
})
cWForm.addEventListener('submit', submitForm)

function submitForm(){
    // Reset msgs
    sucsMsgElm.innerHTML = ''
    errMsgElm.innerHTML = ''

    // Disbale submit button
    cWSubmitBtn.classList.add('disabled')
    cWForm.removeEventListener('submit', submitForm)

    let password = document.querySelector(`#${cWForm.id} .cWForm-item--password input`).value
    ipcRenderer.send('create-key', [cWLabel.value, password])
}