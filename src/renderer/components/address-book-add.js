const kvStore = require('../../storage/main')
const addressBook = require('./address-book')
const popups = require('../popup')

function init() {
    // Load address book
    let walletStore = new kvStore({name: 'address-book'})

    // Form listener
    let form = document.getElementById('address-book-add-form')
    form.addEventListener('submit', function(e) {
        e.preventDefault()

        let label = document.getElementById("addr-book-add-label").value
        // @TODO validate address
        let address = document.getElementById("addr-book-add-address").value
        walletStore.setAddressBookAddr(label, address)

        // Load addresses again
        addressBook.loadAddresses()

        // Close this popup
        document.getElementById('address-book-add').classList.remove('is-shown')

        let popup = document.getElementById('address-book-add')
        popups.clearFormInputs(popup)
    })
}

module.exports = {
    init: function () {
        init()
    }
}