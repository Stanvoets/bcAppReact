// import popups from '../popup'
const popup = document.getElementById('address-book')
const kvStore = require('../../storage/main')
const addressBook = new kvStore({name: 'address-book'})
const popups = require('../popup')

function deleteAddress(label){
    addressBook.deleteAddressBookAddr(label)
}

function loadAddresses(){
    // Load address book
    let addresses = addressBook.getAddressBook()
    let containerElm = document.getElementById('address-book-content')
    containerElm.innerHTML = ''
    let i = 0

    // Sort addresses
    let addressesSort = {}
    Object.keys(addresses)
        .sort(function(a,b){
            return a.toLowerCase().localeCompare(b.toLowerCase());
        })
        .forEach(function(key) {
            addressesSort[key] = addresses[key];
        });

    // Loop through elements and build html with them
    let itemCount = Object.keys(addressesSort).length
    for (let label in addressesSort){
        if (addressesSort.hasOwnProperty(label)) {
            i++
            let address = addressesSort[label];

            let item = document.createElement('div')
            item.classList.add('address-book-item')
            item.classList.add('address-book-item-'+i)
            item.style.zIndex = (itemCount - i).toString()

            let labelText = document.createTextNode(label)
            let labelElm = document.createElement('div')
            labelElm.classList.add('label')
            labelElm.appendChild(labelText)

            let addressText = document.createTextNode(address)
            let addressElm = document.createElement('div')
            addressElm.classList.add('address')
            addressElm.appendChild(addressText)

            item.appendChild(labelElm)
            item.appendChild(addressElm)

            containerElm.appendChild(item)

            // Active state
            item.addEventListener('click', function(){
                let c = 'item-selected'

                document.querySelectorAll('.address-book-item').forEach(function(elm){
                    elm.classList.remove(c)
                })
                item.classList.add(c)
            })

            // Double click on item = confirm
            item.addEventListener('dblclick', function(){
                if (item.classList.contains('item-selected')) {
                    insertAddress()
                }
            })
        }
    }
}

function addressBookDeleteItem() {
    let selectedItem = document.querySelector('.address-book-item.item-selected')
    let label = document.querySelector('.address-book-item.item-selected .label').innerHTML
    selectedItem.classList.add('item-removed')
    setTimeout(function(){
        selectedItem.remove()
    }, 500)
    deleteAddress(label)
}

function insertAddress(){
    let selectedItem = document.querySelector('.address-book-item.item-selected')
    if (selectedItem !== null) {
        let label = document.querySelector('.address-book-item.item-selected .label').innerHTML
        let address = document.querySelector('.address-book-item.item-selected .address').innerHTML
        let labelElm = document.querySelector('form .address-book-annotation')
        let addressInput = document.querySelector('#address')

        // Set label and address
        labelElm.innerHTML = label
        addressInput.value = address

        // Close popup
        document.getElementById('address-book')
            .classList.remove('is-shown')

        // @TODO improve
        setTimeout(function(){
            selectedItem.classList.remove('item-selected')
        }, 255)
    }
}

function init() {
    popups.checkForPopupsToLoad()

    let rmBtn = document.querySelector('.address-book-action--rm')

    // Remove handlers
    rmBtn.addEventListener('click', function(e){
        e.preventDefault()
        addressBookDeleteItem()
    })

    document.addEventListener('keyup', function(e){
        if (popup.classList.contains('is-shown')) {
            if (e.key === 'Delete') {
                addressBookDeleteItem();
            }
        }
    })

    // Select handlers
    document.getElementById('confirm-address').addEventListener('click', function(e){
        e.preventDefault()
        insertAddress()
    })

    document.addEventListener('keydown', function(e){
        if (e.key === 'Enter') {
            insertAddress()
        }
    })
}

module.exports = {
    init: function () {
        init()
        loadAddresses()
    },
    loadAddresses: function () {
        loadAddresses()
    }
};