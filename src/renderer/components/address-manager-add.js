let popup = document.getElementById('address-manager-add')
let form = document.getElementById("form--address-manager-add")
let submitBtn = document.querySelector(`#${form.id} .form-submit`)
let succMsgElm = document.querySelector(`#${form.id} .err-msg`)
let errMsgElm = document.querySelector(`#${form.id} .err-msg`)
const { ipcRenderer } = require('electron')

function init() {

    // Add form listeners
    form.addEventListener('submit', function(e){
        e.preventDefault()
    })
    form.addEventListener('submit', submitForm)

    function submitForm(){
        // Reset msgs
        succMsgElm.innerHTML = ''
        errMsgElm.innerHTML = ''

        // Disbale submit button
        submitBtn.classList.add('disabled')
        form.removeEventListener('submit', submitForm)

        let label = document.querySelector(`#${form.id} .form-item--label input`).value
        let password = document.querySelector(`#${form.id} .form-item--password input`).value
        ipcRenderer.send('create-key', [label, password])
    }

    // Recieve
    ipcRenderer.on('created-key', (event, data) => {
        // Error checking
        if (data === 'err_label_duplicate') {
            errMsgElm.innerHTML = 'This label is already being used on this device!'
        }
        // Success
        else {
            // Close popup
            popup.classList.remove('is-shown')
            // Reload addresses
            ipcRenderer.send('load-addresses')
        }

        // Allow form to be submitted again.
        form.addEventListener('submit', submitForm)
        submitBtn.classList.remove('disabled')
        submitBtn.addEventListener('click', function(e){
            let event = new Event('submit')
            form.dispatchEvent(event)
        })
    })
}

module.exports = {
    init: function () {
        init()
    }
};