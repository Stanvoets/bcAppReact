const sendTx = require("./sendTx")
const loadTx = require("./loadTx")
const staking = require("./staking")
// const balance = require("./balance")

function init(){
    sendTx.addFormListener()
    loadTx.init()
    staking.init()
    // balance.init()
}

module.exports = {
    init: function () {
        init()
    }
}