const path = require('path')
const fs = require('fs')

function checkForPopupsToLoad(){
    console.log('aaaaa')
    document.querySelectorAll('.popup-trigger:not(.is-processed)').forEach(function(elm){
        let popupType = elm.getAttribute('stan-popup')

        if (popupType.length) {
            // Load only once
            // if (document.getElementById(popupType) === null) {
                // Load popup component
            loadPopup(popupType, elm)
            // }
        }
    })
}

function loadPopup(popupName, triggerBtn){
    triggerBtn.classList.add('is-processed')
    // Only load popup when it's not loaded yet
    let popup
    if (document.getElementById(popupName) === null) {
        let popupHtmlFile = path.join('src', 'renderer', 'components', popupName+'.html')
        popup = document.createElement('div')
        document.getElementById('main-container').appendChild(popup)
        console.log('Load popup: '+popupHtmlFile)
        popup.outerHTML = fs.readFileSync(popupHtmlFile, {encoding: 'utf8'})

        // Require popup js
        let fileLocation = path.join('src', 'renderer', 'components', popupName+'.js')
        if (fs.existsSync(fileLocation)) {
            let popupJs = require('./components/'+popupName+'.js')
            popupJs.init()
        }
    }

    popup = document.getElementById(popupName)

    // Show popup on click
    if (!triggerBtn.classList.contains('popup-trigger-custom-handler')) {
        triggerBtn.addEventListener('click', function(){
            popup.classList.add('is-shown')
        })
    }

    // Close button
    let closeBtn = document.querySelector(`#${popupName} .popup-close`)
    closeBtn.addEventListener('click', (e) => {
        // prevent default behaviour
        e.preventDefault()
        closePopup(popup)
    })

    // Close on clicking outside popup
    popup.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('overlay-popup')) {
            closePopup(popup)
        }
    })

    // Close on hitting 'esc'
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Escape') {
            closePopup(popup)
        }
    })
}

function clearFormInputs(popup){
    // @TODO improve this
    setTimeout(function(){
        document.querySelectorAll(`#${popup.id} form input`).forEach(function(elm){
            elm.value = ''
        })
    }, 255)
}

function closePopups(){
    document.querySelectorAll('.overlay-popup').forEach(function(popup){
        closePopup(popup)
    })
}

function closePopup(popup) {
    popup.classList.remove('is-shown')
    clearFormInputs(popup)
}

module.exports = {
    checkForPopupsToLoad: function () {
        checkForPopupsToLoad()
    },
    clearFormInputs: function (popup) {
        clearFormInputs(popup)
    }
}

// export default {
//     checkForPopupsToLoad: function () {
//         checkForPopupsToLoad()
//     },
//     clearFormInputs: function (popup) {
//         clearFormInputs(popup)
//     }
// }