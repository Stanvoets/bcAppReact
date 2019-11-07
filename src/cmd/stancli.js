const { execSync, spawn } = require('child_process')
const kvStore = require('../storage/main')
const conversion = require('../bank/conversion')
const http = require('http')
let dbLock = false
let allAddresses
const stakingCache = new kvStore({name: 'staking'})
const unbondingDelsCache = new kvStore({name: 'unbonding-delegations'})

// Auth inlog to priv key with a label and password
// First convert label to address with keyShow()
function privKeyAuth(key_label, password, ipcEvent) {
    if (!tryDbAndRetryIfFail(privKeyAuth, [key_label, password, ipcEvent])) {
        return
    }

    lockDB()
    let child = spawn(`./bin/stancli`, ['unlock_key', key_label, '--output=json'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.stdin.setEncoding('utf8')
    child.stdin.write(`${password}\n`)
    child.stdin.end()

    child.on('exit', unlockDB)

    // Error
    child.stderr.on('data', function(data){
        console.log(data.toString())
        ipcEvent.reply('unlockPrivateKey', false)
        child.kill('SIGTERM')
    })

    // Success
    child.stdout.on('data', function(){
        // Set some kvStore values.
        // @TODO Move somewhere more generic
        let walletStore = new kvStore({name: 'auth'})
        walletStore.setKeyLabel(key_label)
        let address = keyGetAddress(key_label)
        walletStore.setAddress(address)

        // Trigger event
        ipcEvent.reply('unlockPrivateKey', true)

        child.kill('SIGTERM')
    })
}


// Use 'keys add [label]' to generate a key pair with given label and pwd
function createPrivateKey(key_label, key_pwd, ipcEvent){
    if (!tryDbAndRetryIfFail(createPrivateKey, [key_label, key_pwd, ipcEvent])) {
        return
    }

    lockDB()
    let child = spawn(`./bin/stancli`, ['keys', 'add', key_label, '--output=json'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.stdin.setEncoding('utf8')
    // Send pwd as input to the key generation command
    child.stdin.write(`${key_pwd}\n`)
    child.stdin.end()

    child.on('exit', unlockDB)

    // Keys add returns data in stderr
    child.stderr.on('data', function(data){
        let resp
        try {
            resp = JSON.parse(data.toString('utf8'))
        }
        catch (err) {
            ipcEvent.reply('created-key', 'err_label_duplicate')
            console.log(err)
            return null
        }

        // Success
        if (typeof resp !== 'undefined'){
            console.log('Private key created with label: ' + key_label)
            // Send data back
            ipcEvent.reply('created-key', resp.mnemonic)
        }

        child.kill('SIGTERM')
    })
}

// Attempt to send a transaction with given address and coin amoun
//
function sendTx(address, amount, password, ipcEvent) {
    if (!tryDbAndRetryIfFail(sendTx, [address, amount, password, ipcEvent])) {
        return
    }
    lockDB()

    let walletStore = new kvStore({name: 'auth'})
    let from_address = walletStore.getAddress()

    let child = spawn(`./bin/stancli`, ['tx', 'send',  address, `${conversion.stanToUstan(amount)}ustan`, '--from', from_address, '-b', 'async', '--gas', 'auto', '--gas-prices', '0.1ustan', '--gas-adjustment', 1.2, '--output=json', '-y'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.stdin.setEncoding('utf8')
    child.stdin.write(`${password}\n`)
    child.stdin.end()

    child.on('exit', unlockDB)

    // Error
    child.stderr.on('data', function(data){
        // Error checking
        if (data.toString().indexOf('doesn\'t have enough coins to pay for this transaction') !== -1) {
            ipcEvent.reply('send-tx', 'not-enough-funds');
        }
        else if (data.toString().indexOf('ERROR: invalid account password') !== -1) {
            ipcEvent.reply('send-tx', 'invalid-password');
        }
        ipcEvent.reply('debug', '\nSENDTX ERR:')
        ipcEvent.reply('debug', data.toString())
    })

    // Success
    child.stdout.on('data', function(data){
        child.kill('SIGTERM')
        ipcEvent.reply('debug', '\nSENDTX DATA:')
        ipcEvent.reply('debug', data.toString())
        // console.log('\nOUT:')
        // console.log(data.toString())
        // @TODO improve
        if (data.toString().indexOf('"txhash":') !== -1) {
            // @TODO improve error checking here, also in blockchain
            if (data.toString().indexOf('"code":4') !== -1) {
                ipcEvent.reply('send-tx', data.toString())
            }
            else {
                console.log('\ntx send done')
                ipcEvent.reply('send-tx', true)
                // @TODO implement txProcessedCheck() here
                setTimeout(function(){
                    ipcEvent.reply('new-tx')
                }, 1500)
            }
        }
    })
}

// Delegation tx
function delegateTx(ipcEvent, from_address, to_address, amount, password) {
    if (!tryDbAndRetryIfFail(delegateTx, [ipcEvent, from_address, to_address, amount, password])) {
        return
    }
    lockDB()

    // @TODO Get gas prices from user input?
    let child = spawn(`./bin/stancli`, ['tx', 'staking', 'delegate',  to_address, `${conversion.stanToUstan(amount)}ustan`, '--from', from_address, '-b', 'async', '--gas', 'auto', '--gas-prices', '0.1ustan', '--gas-adjustment', 1.2, '--output=json', '-y'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.stdin.setEncoding('utf8')
    child.stdin.write(`${password}\n`)
    child.stdin.end()

    child.on('exit', unlockDB)

    // Error
    child.stderr.on('data', function(data){
        // Error checking
        if (data.toString().indexOf('doesn\'t have enough coins to pay for this transaction') !== -1) {
            ipcEvent.reply('delegated', 'not-enough-funds');
        }
        if (data.toString().indexOf('insufficient account funds;') !== -1) {
            ipcEvent.reply('delegated', 'gas')
        }
        if (data.toString().indexOf('ERROR: invalid account password') !== -1) {
            ipcEvent.reply('delegated', 'invalid-password')
        }
        else {
            // Exclude gas estimate from error checking
            if (data.toString().indexOf('gas estimate:') === -1) {
                ipcEvent.reply('delegated', 'unknown')
            }
        }
        ipcEvent.reply('debug', '\nDELEGATE TX ERR:')
        ipcEvent.reply('debug', data.toString())
    })

    // Success
    child.stdout.on('data', function(data){
        child.kill('SIGTERM')
        ipcEvent.reply('debug', '\nDELEGATE TX DATA:')
        ipcEvent.reply('debug', data.toString())
        // console.log('\nOUT:')
        // console.log(data.toString())
        // @TODO improve
        if (data.toString().indexOf('"txhash":') !== -1) {
            // @TODO improve error checking here, also in blockchain
            if (data.toString().indexOf('"code":4') !== -1) {
                ipcEvent.reply('delegated', data.toString())
            }
            else {
                ipcEvent.reply('delegated')
                data = JSON.parse(data)
                if (data.txhash !== undefined) {
                    txProcessedCheck(ipcEvent, data.txhash, 'delegation')
                }
            }
        }
    })
}

// Get the sequence of an account.
// @TODO Make async (and merge this and getAccountBalance to start from same generic func)
function getAccountSequence(address) {
    if (!tryDbAndRetryIfFail(getAccountSequence, [address])) {
        return
    }
    let resp;
    try {
        lockDB()
        resp = execSync(`./bin/stancli query account ${address} --output=json`)
        unlockDB()
        resp = JSON.parse(resp.toString())
    }
    catch (err) {
        console.log(err)
    }

    if (resp !== undefined) {
        if (resp.value.sequence !== undefined) {
            return resp.value.sequence
        }
    }
}

function loadAllTxs(ipcEvent, txs = {}) {
    if (Object.keys(allAddresses).length) {
        ipcEvent.reply('debug', 'Load txs for:  ' + allAddresses[0].address)
        loadAllSendTxs(ipcEvent, allAddresses[0].address, 1, txs)
        // Remove current address
        allAddresses.splice(0, 1)
    }
    else {
        if (Object.keys(txs).length) {
            ipcEvent.reply('debug', 'LOADED TXS:\n')
            ipcEvent.reply('debug', txs)

            // Sort by date
            txs.sort(function(a, b){
                let dateA = a.timestamp
                let dateB = b.timestamp

                if (dateA < dateB) {
                    return -1
                }
                if (dateA > dateB) {
                    return 1
                }

                return 0;
            })

            // Cache
            let addressStorage = new kvStore({name: 'tx-cache'})
            addressStorage.saveTxs(txs)

            // Send to front end
            ipcEvent.reply('loaded-txs', txs)
        }
    }
}

function loadAllSendTxs(ipcEvent, address, page, txs) {
    let limit = 100

    if (page === undefined) {
        // Get account sequence and get page nr with that and limit
        let sequence = getAccountSequence(address)
        if (sequence !== undefined && sequence !== '0') {
            ipcEvent.reply('debug', 'SEND TXS SEQUENCE:'+sequence)
            page = Math.ceil(sequence / limit)
            ipcEvent.reply('debug', 'SEND TXS PAGE:'+page)
        }
        else {
            prepLoadAllRecievedTxs(ipcEvent, address, undefined)
            return
        }
    }

    if (!tryDbAndRetryIfFail(loadAllSendTxs, [ipcEvent, address, page, txs])) {
        return
    }
    lockDB()
    let child = spawn(`./bin/stancli`, ['query', 'txs', '--tags', `sender:${address}`, '--limit', limit, '--page', page, '--output=json'], {stdio: ['ignore', 'pipe', 'pipe']})

    child.on('exit', unlockDB)

    // Error
    child.stderr.on('data', function(data){
        child.kill('SIGTERM')
        console.log('\n LOAD ALL SENDTXS ERR:')
        console.log(`${data.toString()}`)
    })

    // Success
    let resp
    child.stdout.on('data', function(data){
        child.kill('SIGTERM')
        resp = JSON.parse(data.toString())
        if (txs !== undefined && txs.length) {
            resp = resp.concat(txs);
        }

        // Load more pages if needed
        if (page > 1) {
            loadAllSendTxs(ipcEvent, address, page - 1, resp)
            return
        }

        // Proceed with loading recieved txs
        prepLoadAllRecievedTxs(ipcEvent, address, resp)
    })
}

// Get the last result page for inc tx
function prepLoadAllRecievedTxs(ipcEvent, address, txs) {
    let options = {
        host: '142.93.235.101',
        port: 26657,
        path: `/tx_search?per_page=1&query="recipient=\'${address}\'"`,
        method: 'GET'
    }

    http.request(options, function(res) {
        res.setEncoding('utf8')

        res.on('data', function (data) {
            data = JSON.parse(data.toString())
            if (data.result.total_count !== undefined) {
                let totalCount = parseInt(data.result.total_count)
                ipcEvent.reply('debug', 'RECIEVED TXS TOTAL COUNT:'+totalCount)
                // Skip if page is 0
                if (totalCount === 0) {
                    loadAllTxs(ipcEvent, txs)
                    return
                }

                // total_items / limit
                let page = Math.ceil(totalCount / 100)
                ipcEvent.reply('debug', 'RECIEVED TXS PAGE:'+page)
                loadAllRecievedTxs(ipcEvent, address, page, txs);
            }
        })
    }).end()
}

function loadAllRecievedTxs(ipcEvent, address, page, txs) {
    if (!tryDbAndRetryIfFail(loadAllRecievedTxs, [ipcEvent, address, page, txs])) {
        return
    }
    lockDB()

    let child = spawn(`./bin/stancli`, ['query', 'txs', '--tags', `recipient:${address}`, '--limit', 100, '--page', page, '--output=json'], {stdio: ['ignore', 'pipe', 'pipe']})

    // Error
    child.stderr.on('data', function(data){
        child.kill('SIGTERM')
        console.log('\n LOAD ALL RECIEVED ERR:')
        console.log(`${data.toString()}`)
    })

    // Success
    let resp
    child.stdout.on('data', function(data){
        child.kill('SIGTERM')

        resp = JSON.parse(data.toString())

        // Add incoming bool to each tx
        let addresses = new kvStore({name: 'address-cache'}).loadAddresses()
        resp.forEach(function (tx, i) {
            tx.incoming = true

            // Remove tx's send by an address from this app (self send tx's)
            addresses.forEach(function(addr){
                if (tx.tx.value.msg[0].value.from_address === addr.address) {
                    // Save index of elm's that need to be removed
                    resp.splice(i, 1)
                }
            })
        })

        // merge arrays
        if (txs !== undefined && txs.length) {
            resp = resp.concat(txs)
        }

        // Load more pages if needed
        if (page > 1) {
            loadAllRecievedTxs(ipcEvent, address, page - 1, resp)
        }

        // Load txs for remaining addresses
        loadAllTxs(ipcEvent, resp)
    })

    child.on('exit', unlockDB)
}

// Load addresses
function loadAddresses(ipcEvent, loadTx = false) {
    if (!tryDbAndRetryIfFail(loadAddresses, [ipcEvent, loadTx])) {
        return
    }
    lockDB()

    let child = spawn(`./bin/stancli`, ['keys', 'list', '--output=json'], {stdio: ['ignore', 'pipe', 'pipe']})

    child.on('exit', unlockDB)

    // Error
    child.stderr.on('data', function(data){
        child.kill('SIGTERM')
        console.log('\nKEYS LIST ERR:')
        console.log(data.toString())
    })

    // Success
    child.stdout.on('data', function(data){
        child.kill('SIGTERM')
        data = JSON.parse(data.toString())
        if (data !== undefined) {
            // Set addresses
            allAddresses = data
            // Also in cache
            new kvStore({name: 'address-cache'})
                .saveAddresses(allAddresses)

            if (loadTx) {
                // @todo improve, refactor oo
                loadAllTxs(ipcEvent)
            }
            else {
                loadAddressesCoins(ipcEvent, data)
            }
        }
    })
}

// function updateBalanceAndTxs(ipcEvent) {
//     // @TODO improve
//     loadAddressesCoins(ipcEvent, new kvStore({name: 'address-cache'}).loadAddresses())
//     allAddresses = new kvStore({name: 'address-cache'}).loadAddresses()
//     loadAllTxs(ipcEvent)
// }

// Load coins for each address
function loadAddressesCoins(ipcEvent, addresses, i = 0, totalCoins = 0) {
    if (addresses === undefined) {
        addresses = new kvStore({name: 'address-cache'}).loadAddresses()
    }
    if (addresses[i] === undefined) {
        ipcEvent.reply('debug', 'LOAD COINS ADDR UNDEFINED index:'+i)
        return
    }
    if (!tryDbAndRetryIfFail(loadAddressesCoins, [ipcEvent, addresses, i])) {
        return
    }
    lockDB()

    let child = spawn(`./bin/stancli`, ['query', 'account', addresses[i].address, '--output=json'], {stdio: ['ignore', 'pipe', 'pipe']})

    // Error
    child.stderr.on('data', function (data) {
        console.log('\nLOAD COINS ERR:')
        console.log(data.toString())
        i++
    })

    // Success
    child.stdout.on('data', function (data) {
        let resp;
        try {
            resp = JSON.parse(data.toString())
        } catch (err) {
            console.log(err)
        }

        if (typeof resp !== 'undefined') {
            if (typeof resp.value.coins === 'object') {
                let stan = conversion.ustanToStan(Number(resp.value.coins[0].amount))
                resp.value.coins[0].amount = stan

                ipcEvent.reply('debug', 'Load coins for ' + addresses[i].address + ':' + stan + 'ustan')

                // Populated with coins
                addresses[i].coins = resp.value.coins
                // @TODO conversion through API
                addresses[i].fiat = stan * 0.06

                totalCoins += stan
            }
        }

        i++
        child.kill('SIGTERM')
    })

    child.on('exit', function () {
        unlockDB()

        // Send addresses to front-end when all are populated with coins
        if (i >= Object.entries(addresses).length) {
            ipcEvent.reply('loaded-addresses', addresses)
            ipcEvent.reply('got-balance', totalCoins)
            ipcEvent.reply('new-tx')
            return
        }

        // Continue populating
        loadAddressesCoins(ipcEvent, addresses, i, totalCoins)
    })
}


// Load key address with label
function keyGetAddress(key_label){
    if (!tryDbAndRetryIfFail(keyGetAddress, [key_label])) {
        return
    }
    try {
        return execSync(`./bin/stancli keys show ${key_label} -a`).toString('utf8').replace('\n', '')
    }
    catch (err) {
        console.log(err)
        return false
    }
}

// Claim staking rewards for all delegations
function claimStakingRewards(ipcEvent, password, delegations = undefined) {
    if (!tryDbAndRetryIfFail(claimStakingRewards, [ipcEvent, password, delegations])) {
        return
    }
    lockDB()

    if (delegations === undefined) {
        delegations = new kvStore({name: 'staking'}).getDelegations()
    }

    let i = Object.keys(delegations)[0] // Get first key

    let child = spawn('./bin/stancli', ['tx', 'distr', 'withdraw-all-rewards', '--from', delegations[i].key_label, '--gas', 'auto', '--gas-prices', '0.1ustan', '--gas-adjustment', 1.2, '--output=json', '-y'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.stdin.setEncoding('utf8')
    child.stdin.write(`${password}\n`)
    child.stdin.end()

    child.on('exit', unlockDB)

    child.stderr.on('data', function(data){
        ipcEvent.reply('debug',  'CLAIM ERR')
        ipcEvent.reply('debug', data.toString())
        ipcEvent.reply('delegated')
    })

    child.stdout.on('data', function(data){
        // @TODO [bc] error should be in stderr not stdout
        if (data.toString().indexOf('insufficient funds to pay for fees;') !== -1) {
            ipcEvent.reply('delegated', 'gas')
            ipcEvent.reply('claimed-staking-rewards')
            return
        }

        delete delegations[i]

        if (Object.keys(delegations).length) {
            claimStakingRewards(ipcEvent, password, delegations)
        }
        else {
            ipcEvent.reply('claimed-staking-rewards', true)
        }

        ipcEvent.reply('debug', 'CLAIM DATA')
        ipcEvent.reply('debug', data.toString())
    })
}

// Claim staking rewards for a single delegation
function claimDelegationReward(ipcEvent, password, delegation) {
    if (!tryDbAndRetryIfFail(claimDelegationReward, [ipcEvent, password, delegation])) {
        return
    }
    lockDB()

    let child = spawn('./bin/stancli', ['tx', 'distr', 'withdraw-all-rewards', '--from', delegation.key_label, '--gas', 'auto', '--gas-prices', '0.1ustan', '--gas-adjustment', 1.2, '--output=json', '-y'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.stdin.setEncoding('utf8')
    child.stdin.write(`${password}\n`)
    child.stdin.end()

    child.on('exit', unlockDB)

    child.stderr.on('data', function(data){
        if (data.toString().indexOf('gas estimate: ') === -1) {
            ipcEvent.reply('debug',  'CLAIM ERR')
            ipcEvent.reply('debug', data.toString())
        }
    })

    child.stdout.on('data', function(data){
        ipcEvent.reply('claimed-delegation-reward')

        ipcEvent.reply('debug', 'CLAIM DATA')
        ipcEvent.reply('debug', data.toString())
    })
}

// Redelegate delegation
function redelegate(ipcEvent, password, delegation, newValAddr, amount) {
    if (!tryDbAndRetryIfFail(redelegate, [ipcEvent, password, delegation, newValAddr, amount])) {
        return
    }
    lockDB()

    let child = spawn('./bin/stancli', ['tx', 'staking', 'redelegate', delegation.validator_address, newValAddr, `${conversion.stanToUstan(amount)}ustan`, '--from', delegation.key_label, '--gas', 'auto', '--gas-prices', '0.1ustan', '--gas-adjustment', 1.3, '--output=json', '-y'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.stdin.setEncoding('utf8')
    child.stdin.write(`${password}\n`)
    child.stdin.end()

    child.on('exit', unlockDB)

    child.stderr.on('data', function(data){
        // Error checking
        if (data.toString().indexOf('doesn\'t have enough coins to pay for this transaction') !== -1) {
            ipcEvent.reply('delegated', 'not-enough-funds');
        }
        if (data.toString().indexOf('insufficient account funds;') !== -1) {
            ipcEvent.reply('delegated', 'gas')
        }
        if (data.toString().indexOf('ERROR: invalid account password') !== -1) {
            ipcEvent.reply('delegated', 'invalid-password')
        }
        else {
            // Exclude gas estimate from error checking
            if (data.toString().indexOf('gas estimate:') === -1) {
                ipcEvent.reply('delegated', 'unknown')
            }
        }
        ipcEvent.reply('debug',  'REDELEGATE ERR')
        ipcEvent.reply('debug', data.toString())
    })

    child.stdout.on('data', function(data){
        // @TODO check if actual completed
        ipcEvent.reply('delegated')
        data = JSON.parse(data)
        if (data.txhash !== undefined) {
            txProcessedCheck(ipcEvent, data.txhash, 'delegation')
        }

        ipcEvent.reply('debug', 'REDELEGATE DATA')
        ipcEvent.reply('debug', data)
    })
}

// Unbond delegation
function unbond(ipcEvent, password, delegation, amount) {
    if (!tryDbAndRetryIfFail(unbond, [ipcEvent, password, delegation, amount])) {
        return
    }
    lockDB()

    let child = spawn('./bin/stancli', ['tx', 'staking', 'unbond', delegation.validator_address, `${conversion.stanToUstan(amount)}ustan`, '--from', delegation.key_label, '--gas', 'auto', '--gas-prices', '0.1ustan', '--gas-adjustment', 1.2, '--output=json', '-y'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.stdin.setEncoding('utf8')
    child.stdin.write(`${password}\n`)
    child.stdin.end()

    child.on('exit', unlockDB)

    child.stderr.on('data', function(data){
        // Error checking
        if (data.toString().indexOf('ERROR: invalid account password') !== -1) {
            ipcEvent.reply('delegated', 'invalid-password')
        }

        if (data.toString().indexOf('insufficient account funds;') !== -1) {
            ipcEvent.reply('delegated', 'gas')
        }

        ipcEvent.reply('debug',  'UNBOND ERR')
        ipcEvent.reply('debug', data.toString())
    })

    child.stdout.on('data', function(data){
        // @TODO check if actual completed
        ipcEvent.reply('unbonded')
        data = JSON.parse(data)
        if (data.txhash !== undefined) {
            txProcessedCheck(ipcEvent, data.txhash, 'unbond')
        }
        ipcEvent.reply('debug', 'UNBOND DATA')
        ipcEvent.reply('debug', data)
    })
}

// Check if a tx was processed in the bc
// txType is so we know what to update in the front end later
function txProcessedCheck(ipcEvent, txHash, txType) {
    if (!tryDbAndRetryIfFail(txProcessedCheck, [ipcEvent, txHash, txType])) {
        return
    }
    lockDB()

    let child = spawn('./bin/stancli', ['query', 'tx', txHash, '--output=json'], {stdio: ['pipe', 'pipe', 'pipe']})

    child.on('exit', unlockDB)

    child.stderr.on('data', function(data){
        if (data.toString().indexOf('ERROR: Tx: Response error: RPC error -32603') !== -1) {
            ipcEvent.reply('debug',  'Recalled txProcessedCheck')
            // @TODO prevent infinite + add timeout
            txProcessedCheck(ipcEvent, txHash, txType)
        }
        ipcEvent.reply('debug',  'TX PROC CHECK ERR')
        ipcEvent.reply('debug', data.toString())
    })

    child.stdout.on('data', function(data){
        data = JSON.parse(data)
        if (data.txhash !== undefined) {
            let action = 'delegated'
            switch (txType) {
                // case 'delegation':
                //     action = 'delegated'
                //     break
                case 'unbond':
                    action = 'unbonded'
                    break
            }
            // Errors
            if (data.logs[0].log.indexOf('insufficient account funds;') !== -1) {
                ipcEvent.reply('delegated', 'not-enough-funds')
            }

            // Success
            if (data.logs[0].success) {
                ipcEvent.reply(action, true)
                loadDelegations(ipcEvent)

                if (txType === 'unbond') {
                    loadUnbondingDelegations(ipcEvent)
                }
            }
        }

        ipcEvent.reply('debug', 'TX CHECK-PROC DATA')
        ipcEvent.reply('debug', data)
    })
}

// Load staking rewards
function loadStakingRewards(ipcEvent, delegations = undefined, coins = 0){
    if (!tryDbAndRetryIfFail(loadStakingRewards, [ipcEvent, delegations, coins])) {
        return
    }

    if (delegations === undefined) {
        delegations = new kvStore({name: 'staking'}).getDelegations()
    }

    let i = Object.keys(delegations)[0] // Get first key
    if (delegations[i] !== undefined) {
        lockDB()
        let child = spawn(`./bin/stancli`, ['query', 'distr', 'rewards', delegations[i].delegator_address, delegations[i].validator_address, '--output', 'json'], {stdio: ['ignore', 'pipe', 'pipe']})

        child.on('exit', unlockDB)

        child.stderr.on('data', function(data){
            child.kill('SIGTERM')
            // Error checking
            if (data.toString().indexOf('ERROR: invalid account password') !== -1) {
                ipcEvent.reply('delegated', 'invalid-password')
            }

            if (data.toString().indexOf('insufficient account funds;') !== -1) {
                ipcEvent.reply('delegated', 'gas')
            }

            ipcEvent.reply('debug',  'LOAD STAKING REWARDS ERR')
            ipcEvent.reply('debug', data.toString())
        })

        child.stdout.on('data', function(data){
            child.kill('SIGTERM')
            data = JSON.parse(data.toString('utf8'))
            let delegationReward
            if (data !== null) {
                coins +=  parseInt(data[0].amount)
                delegationReward = conversion.ustanToStan(parseInt(data[0].amount))
                // ipcEvent.reply('debug', delegationReward)
                ipcEvent.reply('loaded-delegation-reward', delegationReward, delegations[i].delegator_address, delegations[i].validator_address)

                // Cache reward
                stakingCache.saveDelegationReward(delegations[i].delegator_address, delegations[i].validator_address, delegationReward)
            }

            delete delegations[i]

            if (Object.keys(delegations).length) {
                loadStakingRewards(ipcEvent, delegations, coins)
            }
            else {
                // Ping to front end
                ipcEvent.reply('loaded-staking-rewards', conversion.ustanToStan(coins))

                // Cache total rewards
                stakingCache.saveUnclaimedCoins(conversion.ustanToStan(coins))
            }
        })
    }
}

/*
* load staking delegations
*
* If called without $addresses it will load all addresses from cache and keep calling itself till all addresses are processed.
* */
function loadDelegations(ipcEvent, addresses = undefined, delegations = []){
    if (!tryDbAndRetryIfFail(loadDelegations, [ipcEvent, addresses, delegations])) {
        return
    }

    if (addresses === undefined) {
        addresses = new kvStore({name: 'address-cache'}).loadAddresses()
    }

    let i = Object.keys(addresses)[0] // Get first key
    lockDB()
    let child = spawn(`./bin/stancli`, ['query', 'staking', 'delegations', addresses[i].address, '--output', 'json'], {stdio: ['ignore', 'pipe', 'pipe']})

    child.on('exit', unlockDB)

    child.stderr.on('data', function(data){
        child.kill('SIGTERM')
        console.log('LOAD DELEGATIONS ERR:')
        console.log(data.toString('utf8'))
    })

    child.stdout.on('data', function(data){
        child.kill('SIGTERM')
        data = JSON.parse(data.toString('utf8'))
        if (data !== null) {
            data.forEach(function(delegation){
                // Ustan conversion
                delegation.shares = conversion.ustanToStan(delegation.shares)

                // Store key label with delegation
                delegation.key_label = addresses[i].name

                // Cache delgator/validator pair
                stakingCache.saveDelegation(delegation, ipcEvent)

                delegations.push(delegation)
            })
        }

        delete addresses[i];

        if (Object.keys(addresses).length) {
            loadDelegations(ipcEvent, addresses, delegations)
        }
        else {
            ipcEvent.reply('loaded-delegations', delegations)
        }
    })
}


/*
* load staking delegations
* */
function loadUnbondingDelegations(ipcEvent, addresses = undefined, delegations = []){
    if (!tryDbAndRetryIfFail(loadUnbondingDelegations, [ipcEvent, addresses, delegations])) {
        return
    }

    if (addresses === undefined) {
        addresses = new kvStore({name: 'address-cache'}).loadAddresses()
    }

    let i = Object.keys(addresses)[0] // Get first key
    lockDB()
    let child = spawn(`./bin/stancli`, ['query', 'staking', 'unbonding-delegations', addresses[i].address, '--output', 'json'], {stdio: ['ignore', 'pipe', 'pipe']})

    child.on('exit', unlockDB)

    child.stderr.on('data', function(data){
        child.kill('SIGTERM')
        console.log('LOAD UNBONDINGS ERR:')
        console.log(data.toString('utf8'))
    })

    child.stdout.on('data', function(data){
        child.kill('SIGTERM')
        data = JSON.parse(data.toString('utf8'))
        if (data !== null) {
            data.forEach(function(unbond_del){
                delegations.push(unbond_del)
            })
        }

        delete addresses[i];

        if (Object.keys(addresses).length) {
            loadUnbondingDelegations(ipcEvent, addresses, delegations)
        }
        else {
            ipcEvent.reply('loaded-unbonding-delegations', delegations)

            unbondingDelsCache.saveUnbondingDelegations(delegations)
        }
    })
}


// Use 'keys add [label]' to generate a key pair with given label and pwd
function deleteKey(ipcEvent, label){
    if (!tryDbAndRetryIfFail(deleteKey, [ipcEvent, label])) {
        return
    }

    lockDB()
    let child = spawn(`./bin/stancli`, ['keys', 'delete', label, '-f'], {stdio: ['ignore', 'pipe', 'pipe']})

    child.on('exit', unlockDB)

    // Keys add returns data in stderr
    child.stderr.on('data', function(data){
        child.kill('SIGTERM')
        // Success
        if (data.toString('utf8').indexOf('Key deleted forever') !== -1) {
            ipcEvent.reply('deleted-key')
        }
        // Failed
        else {
            console.log('KEYS DELETE ERR:')
            console.log(data.toString('utf8'));
        }
    })
}

function tryDbAndRetryIfFail(func, args = [], timeout = 300) {
    console.log(`RUN ${func.name}`)
    if (!dbIsLocked()) {
        console.log('db is unlocked')
        return true
    }

    setTimeout(function(){
        func(...args)
    }, timeout)

    console.log('db is locked')
    return false
}

function dbIsLocked() {
    return dbLock
}

function lockDB() {
    console.log('DB LOCKED')
    dbLock = true
}

function unlockDB() {
    console.log('DB UNLOCKED')
    dbLock = false
}


module.exports = {
    privKeyAuth: function (key_label, password, ipcEvent) {
        privKeyAuth(key_label, password, ipcEvent)
    },
    createPrivateKey: function(key_label, key_pwd, ipcEvent){
        createPrivateKey(key_label, key_pwd, ipcEvent)
    },
    sendTx: function(to_address, amount, password, ipcEvent){
        sendTx(to_address, amount, password, ipcEvent)
    },
    delegateTx: function(ipcEvent, from_address, to_address, amount, password){
        delegateTx(ipcEvent, from_address, to_address, amount, password)
    },
    getAccountBalance: function(event, notify, address){
        getAccountBalance(event, notify, address)
    },
    // loadTxs: function(event, limit, address){
    //     loadTxs(event, limit, address)
    // },
    loadAllTxs: function(event){
        loadAddresses(event, true)
    },
    loadDelegations: function(event){
        loadDelegations(event)
    },
    loadUnbondingDelegations: function(event){
        loadUnbondingDelegations(event)
    },
    updateBalanceAndTxs: function(event){
        // @TODO Remove 'allAddresses' global and use something better
        allAddresses = new kvStore({name: 'address-cache'}).loadAddresses()
        loadAllTxs(event)
        loadAddressesCoins(event)
    },
    claimStakingRewards: function(event, pwd, delegations){
        claimStakingRewards(event, pwd, delegations)
    },
    claimDelegationReward: function(event, pwd, delegation){
        claimDelegationReward(event, pwd, delegation)
    },
    redelegate: function(ipcEvent, password, delegation, newValAddr, amount){
        redelegate(ipcEvent, password, delegation, newValAddr, amount)
    },
    unbond: function(ipcEvent, password, delegation, amount){
        unbond(ipcEvent, password, delegation, amount)
    },
    loadStakingRewards: function(event){
        loadStakingRewards(event)
    },
    loadAddresses: function(event, loadTx){
        return  loadAddresses(event, loadTx)
    },
    deleteKey: function(event, label){
        return  deleteKey(event, label)
    }
}