const fs = require("fs")
const path = require('path')
const attr_name = 'stan-component'

// Load components
function init() {

    document.querySelectorAll(`*[${attr_name}]`).forEach(function(elm){
        let component_name = elm.getAttribute(attr_name)
        loadComponent(component_name, elm)
    })
}

function loadComponent(componentName, elm){
    let component_html = path.join('src', 'renderer', 'components', componentName+'.html')
    elm.innerHTML = fs.readFileSync(component_html, {encoding: 'utf8'})

    // Require component js
    let component_js = require('./components/'+componentName+'.js')
    component_js.init()
}


export default {
    init: function(){
        init()
    }
}