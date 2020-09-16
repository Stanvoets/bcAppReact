const { app } = require('electron')
const node_sync = require('./src/blockchain/sync')
const auth = require('./src/auth/main')
const routing = require("./src/routing/main")
const addressManager = require("./src/address_manager/main")
const bank = require("./src/bank/main")
const windowManager = require("./src/window/manager")
const updateWatcher = require('./src/updateWatcher/main')

// Bootstrap
function appInit() {
  node_sync.init()
}

// Start
function appStart() {
  windowManager.init()
  routing.init()
  auth.init()
  bank.init()
  addressManager.init()
  updateWatcher.init()
}

// Shutdown
function appStop() {
  node_sync.stop()
}


app.on('will-finish-launching', appInit)
app.on('ready', appStart)
app.on('before-quit', appStop)

// Handle shutdown
app.on('window-all-closed', function(){
  if (process.platform !== 'darwin') {
    app.quit()
  }
})