const { spawn } = require('child_process')
const homedir = require('os').homedir()

function startSync(){

    let sync_process = spawn(`${homedir}/go/bin/stand`, ['start'], {stdio: ['ignore', 'pipe', 'pipe']})

    sync_process.stderr.on('data', function(data){
        console.log('\n STAND START ERR')
        console.log(data.toString('utf8'))
    })

    sync_process.on('exit', function(){
        console.log('stand exited');
    })

    return sync_process
}

module.exports = {
    start: function () {
        return startSync()
    }
}