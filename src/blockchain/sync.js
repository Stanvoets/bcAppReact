const ProgressBar = require('../progressbar');
const { exec } = require('child_process')
const fs = require("fs")
const path = require('path')
const homedir = require('os').homedir()
const stand = require('../cmd/stand')
let sync_process
let progressBar

function startNodeSync(){
    verifyConfigFiles()
    sync_process = stand.start()
    sync_process.stdout.on('data', getNodeSyncStatus)
    sync_process.stdout.on('data', updateProgressBarDetail)
    return sync_process
}

function updateProgressBarDetail(data){
    let s = data.toString('utf8')
    if (s.indexOf('Executed block') !== -1) {
        // Get length of the block height int (-1 for the space between the int and 'validTxs')
        let h = s.slice(s.indexOf('height=') + 7, s.indexOf('validTxs=') - 1)
        if (progressBar !== undefined) {
            if (!progressBar.isCompleted()) {
                progressBar.value = parseInt(h)
            }
        }
        else {
            console.log('New block: ' + h)
        }
    }
}

function getNodeSyncStatus(data){
    // Check if a block is executed, then the syncing has started
    // @TODO improve
    if (data !== undefined){
        if (data.toString('utf8').search("Executed block") !== -1) {
            console.log('Syncing started!')
            initProgressBar()
            // Unbind data event
            sync_process.stdout.off('data', getNodeSyncStatus)
        }
    }
}

function stopNodeSync(){
    sync_process.kill('SIGTERM')
    console.log('\nkilled stand')
}


function verifyConfigFiles(){
    // @TODO get paths from config
    let stand_folder = path.join(homedir, '.stand');
    let config_folder = path.join(stand_folder, 'config');
    let genesis_file = path.join(config_folder, 'genesis.json')
    let config_file = path.join(config_folder, 'config.toml')
    let src_file = path.join(__dirname, 'config', 'genesis.json');

    if (!fs.existsSync(stand_folder)){
        fs.mkdirSync(stand_folder);
    }

    if (!fs.existsSync(config_folder)){
        fs.mkdirSync(config_folder);
    }

    // Check for config files and create them if needed.
    if (!fs.existsSync(genesis_file)){
        // Create genesis file
        let data = fs.readFileSync(src_file, {encoding: 'utf8'})
        fs.openSync(genesis_file, 'w')
        fs.writeFileSync(genesis_file, data)
        console.log('genesis.json created');
    }
    console.log('genesis.json found');

    if (!fs.existsSync(config_file)){
        // Create config file
        src_file = path.join(__dirname, 'config', 'config.toml');
        let data = fs.readFileSync(src_file, {encoding: 'utf8'})
        fs.openSync(config_file, 'w')
        fs.writeFileSync(config_file, data)
        console.log('config.toml created');
    }
    console.log('config.toml found');
}


// Get server block height and pass as maxValue in buildProgressBar
// @TODO implement db check and retry here
function initProgressBar() {
    // @TODO move to stancli.js
    const child = exec('./bin/stancli query block -n tcp://142.93.235.101:26657')

    child.stderr.on('data', function (err) {
        child.kill('SIGTERM')
        console.log('\nQUERY SERVER BLOCK ERR:')
        console.log(err)
    })

    child.stdout.on('data', function (data) {
        child.kill('SIGTERM')

        child.on("exit", function () {
            // Get JSON and set it on progress bar
            let server_height = JSON.parse(data).block.header.height
            buildProgressBar(parseInt(server_height))
        })
    })
}

function buildProgressBar(maxValue){
    progressBar = new ProgressBar({
        indeterminate: false,
        text: 'Syncing the Stan blockchain',
        detail: 'Starting sync...',
        maxValue: maxValue,
        style: {
            text: {
                'font-weight': '400',
                'color': '#353535',
                'text-align': 'center',
            },
            detail: {
                'color': '#353535',
                'text-align': 'center',
            },
        },
        browserWindow: {
            height: 500,
            width: 500,
            webPreferences: {
                nodeIntegration: true
            }
        }
    })
    progressBar
        .on('completed', function() {
            progressBar.detail = 'Stan blockchain successfully synced!';
        })

        .on('aborted', function(value) {
            console.info(`Syncing stopped, last block: ${value}`)
            stopNodeSync(sync_process)
        })
        .on('progress', function(value) {
            let progress = Math.round(value / progressBar.getOptions().maxValue * 100)
            // Never show
            if (value !== progressBar.getOptions().maxValue && progress === 100) {
                progress = 99
            }
            progressBar.detail = `${value} of ${progressBar.getOptions().maxValue} blocks (${progress}%)` ;
        })

    return progressBar
}

// @TODO remove
// // Get block height from local node
// function startProgressBarSync(progressBar) {
//     // const child = exec('./bin/stancli query block')
//     //
//     // child.stderr.on('data', function (err) {
//     //     console.log('QUERY BLOCK ERR:')
//     //     console.log(err)
//     // })
//     //
//     // child.stdout.on('data', async function (data) {
//     //     child.kill('SIGTERM')
//     //
//     //     // Get JSON and set it on progress bar
//     //     let block_height = JSON.parse(data).block.header.height
//     //
//     //     child.on("exit", function () {
//     //         progressBar.value = parseInt(block_height)
//     //         console.log('aaaa');
//     //         console.log(progressBar.detail);
//     //         if (!progressBar.isCompleted()) {
//     //             startProgressBarSync(progressBar)
//     //         }
//     //     })
//     // });
// }

module.exports = {
    init: function () {
      return startNodeSync()
    },
    stop: function () {
      stopNodeSync()
    }
}