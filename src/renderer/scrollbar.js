import PerfectScrollbar from 'perfect-scrollbar'

function init() {
    // Custom scrollbar
    document.querySelectorAll('.scroll-bar-custom').forEach(function(elm){
        new PerfectScrollbar(elm)
    })
}


export default {
    init: function () {
        init()
    }
}