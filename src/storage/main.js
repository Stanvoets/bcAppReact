const Store = require('electron-store')


class kvStore extends Store {
    constructor (settings) {
        // init parent class
        super(settings)

        this.address = this.get('address') || ''
        this.addressBook = this.get('addresses') || {}
        this.addresses = this.get('addresses') || {}
        this.delegations = this.get('delegations') || []
        this.unbondingDels = this.get('unbonding_delegations') || []
        this.txs = this.get('txs') || []
        this.unclaimed_coins = this.get('unclaimed_coins') || 0
        this.keyLabel = this.get('key_label') || ''
        this.coins = this.get('coins') || 0
        this.sequence = this.get('sequence') || 0
    }

    setAddress(value){
        this.set('address', value)
        return this
    }

    getAddress(){
        this.address = this.get('address') || ''
        return this.address
    }

    setKeyLabel(value){
        this.set('key_label', value)
        return this
    }

    getKeyLabel(){
        this.keyLabel = this.get('key_label') || ''
        return this.keyLabel
    }

    setCoins(value){
        this.set('coins', value)
        return this
    }

    getCoins(){
        this.coins = this.get('coins') || 0
        return this.coins
    }

    setSequence(value){
        this.set('sequence', value)
        return this
    }

    getSequence(){
        this.sequence = this.get('sequence') || 0
        return this.sequence
    }

    getAddressBook(){
        this.addressBook = this.get('addresses') || {}
        return this.addressBook
    }

    setAddressBookAddr(label, value){
        let addressBook = this.getAddressBook()
        addressBook[label] = value
        this.set('addresses', addressBook)
        return this
    }

    deleteAddressBookAddr(label){
        let addressBook = this.getAddressBook()
        delete addressBook[label]
        this.set('addresses', addressBook)
        return this
    }

    // getAddressBookAddr(label){
    //     this.addressBook = this.get('addresses')
    //     return this.addressBook[label] || ''
    // }

    getAddressLabel(addr){
        let addresses = this.get('addresses')
        if (addresses !== undefined) {
            for (let i in addresses) {
                if (addresses.hasOwnProperty(i)) {
                    if (addresses[i].address === addr) {
                        return addresses[i].name
                    }
                }
            }
        }

        return addr
    }

    getAddrBookAddressLabel(addr){
        let addresses = this.get('addresses')
        if (addresses !== undefined) {
            for (let label in addresses) {
                if (addresses.hasOwnProperty(label)) {
                    if (addresses[label] === addr) {
                        return label
                    }
                }
            }
        }

        return addr
    }

    loadAddresses(){
        this.addresses = this.get('addresses') || {}
        return this.addresses
    }

    saveAddresses(value){
        this.set('addresses', value)
        return this
    }

    saveTxs(value){
        this.set('txs', value)
        return this
    }

    getTxs(){
        this.txs = this.get('txs') || []
        return this.txs
    }

    saveUnclaimedCoins(value){
        this.set('unclaimed_coins', value)
        return this
    }

    getUnclaimedCoins(){
        this.unclaimed_coins = this.get('unclaimed_coins') || 0
        return this.unclaimed_coins
    }

    // Get all delegations
    getDelegations(){
        this.delegations = this.get('delegations') || []
        return this.delegations
    }

    // Get all delegations
    getUnbondingDelegations(){
        this.unbondingDels = this.get('unbonding_delegations') || []
        return this.unbondingDels
    }

    saveUnbondingDelegations(data){
        this.set('unbonding_delegations', data)
    }

    // Get specific delegation by delAddr and valAddr
    getDelegation(delAddr, valAddr){
        let delegations = this.get('delegations') || []

        delegations.find(function(element){
            if (element.delegator_address === delAddr) {
                if (element.validator_address === valAddr) {
                    return element
                }
            }

            return null
        })
    }

    saveDelegation(data){
        let delegations = this.getDelegations()
        let found = false

        // Check for existing (check del addr and val addr)
        delegations.findIndex(function(element, i){
            if (element.delegator_address === data.delegator_address) {
                if (element.validator_address === data.validator_address) {
                    // Update existing
                    delegations[i] = data
                    found = true
                }
            }

            return null
        })

        if (!found || !delegations.length) {
            delegations.push(data)
        }

        this.set('delegations', delegations)

        return this
    }

    saveDelegationReward(del, val, coins){
        let delegations = this.getDelegations()

        delegations.findIndex(function(elm, i){
            if (delegations[i].delegator_address === del) {
                if (delegations[i].validator_address === val) {
                    delegations[i].unclaimed_coins = coins
                }
            }

            return null
        })

        this.set('delegations', delegations)
    }

    deleteDelegation(del, val){
        let delegations = this.getDelegations()
        let key = Object.keys(delegations).find(key => delegations[del] === val)

        delete delegations[key]
        this.set('delegations', delegations)
        return this
    }
}

module.exports = kvStore

