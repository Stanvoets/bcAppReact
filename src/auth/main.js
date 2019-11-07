const unlockKey = require("./unlockKey")
const createKey = require("./createKey")
const deleteKey = require("./deleteKey")


function initAuth(){
  unlockKey.addFormListener()
  createKey.addFormListener()
  deleteKey.init()
}

module.exports = {
  init: function () {
    initAuth()
  }
};