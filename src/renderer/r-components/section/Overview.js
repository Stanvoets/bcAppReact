import React from 'react'
import Section from './Section'
const kvStore = require('../../../storage/main')
const walletStore = new kvStore({name: 'auth'})


class Overview extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            label: walletStore.getKeyLabel(),
            address: walletStore.getAddress()
        }
    }

    render() {
        return(
            <Section id="overview">
                <h3>Welcome <span id="key-label-value">{this.state.label}</span>!</h3>
                <div className="address">
                <div className="label">Address: <span id="address-value">{this.state.address}</span></div>
                </div>
                <div id="latest-transactions" className="sh-block" stan-component="latest-transactions"></div>
            </Section>
        )
    }

}

export default Overview