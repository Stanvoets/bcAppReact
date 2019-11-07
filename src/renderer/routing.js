const { ipcRenderer } = require('electron')

function init () {
    // Watch for 'content rendered' event. (DOM ready to show)
    ipcRenderer.on('content-rendered', function () {
        console.log('Content rendered')
        document.body.classList.add('content-rendered')
        document.querySelector('section.section-default').classList.add('is-shown')
    })

    // Watch for section changes
    ipcRenderer.on('change-section', function (e, section) {
        console.log('Change section: ' + section)

        // @TODO do this a little cleaner
        if (section !== 'auth-start') {
            document.body.classList.remove('auth-start')
        }
        else {
            document.body.classList.add('auth-start')
        }

        if (document.querySelector('.route-current')) {
            document.querySelector('.route-current').classList.remove('route-current');
        }
        if (document.querySelector(`.route--${section}`)) {
            document.querySelector(`.route--${section}`).classList.add('route-current');
        }

        document.querySelector('section.is-shown').classList.remove('is-shown')
        document.querySelector(`#${section}`).classList.add('is-shown')
    })

    // Init routing links
    document.querySelectorAll('.route-link').forEach(function(elm){
        let routeType = elm.getAttribute('stan-route')
        if (routeType.length) {
            elm.addEventListener('click', (evt) => {
                // prevent default behaviour
                evt.preventDefault()

                // Remove messages
                document.querySelectorAll('.status-msg').forEach(function(elm){
                    elm.innerHTML = ''
                })

                // send to main process
                ipcRenderer.send('routing', [routeType])
            })
        }
    })
}

export default {
    init: function(){
        init()
    }
}