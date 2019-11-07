import routing from './renderer/routing.js'
import popups from './renderer/popup.js'
import scrollbars from './renderer/scrollbar.js'
import updateWatcher from './renderer/update-watcher.js'
// @TODO make r-comps
import components from './renderer/component.js'
import sendTx from './renderer/sendtx.js'
import staking from './renderer/staking.js'


// import logo from './logo.svg';
import React from 'react';
import Overview from './renderer/r-components/section/Overview'
import './css/bootstrap.min.css'
import './css/bootstrap-grid.min.css'
import './css/bootstrap-reboot.css'
import './css/style.css'


class App extends React.Component {

  componentDidMount() {
    routing.init()

    components.init()

    popups.checkForPopupsToLoad()
    scrollbars.init()

    updateWatcher.init()
    sendTx.init()
    staking.init()
}

  render() {
    return (
      <div id="app" className="main-app-layout">
        <div id="main-container">
          <div className="sidebar">
            <div id="balance-block" stan-component="balance-block"></div>
            <div className="menu menu-overview">
              <a className="route-link route--overview route-current" stan-route="overview">Overview</a>
              <a className="route-link route--sendtx" stan-route="sendtx">Send</a>
              <a className="route-link route--wallet" stan-route="wallet">My wallet</a>
              <a className="route-link route--transactions" stan-route="transactions">Transactions</a>
              <a className="route-link route--delegate" stan-route="delegate">Staking</a>
            </div>
          </div>
          <div className="main-content container wide-gutter">

            <Overview />

            {/* @TODO change to component*/}
            <section id="sendtx" className="app-section">
              <div className="inner">
                <h4 className="section-title sh-border">Send STAN</h4>
                <form id="form--send-tx">
                  <div className="sucs-msg status-msg"></div>
                  <div className="err-msg status-msg"></div>
                  <div className="form-item form-item--address form-item-icon form-item-icon--send">
                    <label htmlFor="address">Send to</label>
                    <input id="address" type="text" placeholder="Address" required></input>
                      <div className="popup-trigger popup-trigger--address-book icon-btn icon-address-book"
                           stan-popup="address-book"></div>
                      <div className="address-book-annotation"></div>
                  </div>
                  <div className="form-item form-item--amount form-item-icon form-item-icon--currency">
                    <label htmlFor="amount">Amount</label>
                    <input id="amount" type="number" placeholder="0.00" step="0.001" required></input>
                  </div>
                  <div className="gas-estimate">
                    <span className="label">Transaction fee:</span>
                    <span className="value">0.000001 STAN</span>
                  </div>
                  <button className="popup-trigger popup-trigger-custom-handler popup-trigger--password-confirm"
                          stan-popup="password-confirm">Send STAN
                  </button>
                </form>
              </div>
            </section>

            {/* @TODO change to component*/}
            <section id="wallet" className="app-section scroll-bar-custom">
              <div className="inner">
                <h4 className="section-title sh-border">
                  <span className="title">My wallet</span>
                  <span className="address-manager-actions">
              <span className="icon-btn icon-trash-can address-manager-action--rm"></span>
              <span className="icon-btn icon-plus address-manager-action--add popup-trigger"
                    stan-popup="address-manager-add"></span>
            </span>
                </h4>
                <div id="address-manager" stan-component="address-manager"></div>
              </div>
            </section>
            <section id="transactions" className="app-section">
              <h4 className="section-title sh-border">Transactions</h4>
              <div id="transactions-overview" stan-component="transactions-overview" className="transaction-items"></div>
            </section>

            {/* @TODO change to component*/}
            <section id="delegate" className="app-section scroll-bar-custom">
              <div className="inner">
                <h4 className="section-title sh-border">Staking</h4>
                <div className="sucs-msg status-msg"></div>
                <div className="err-msg status-msg"></div>
                <button className="btn-inversed">
                  <a href="https://google.com">Browse validators</a>
                </button>
                <button className="btn-inversed popup-trigger popup-trigger--unbonding-overview"
                        stan-popup="unbonding-overview">Unbonding delegations
                </button>
                <button className="popup-trigger popup-trigger--create-delegation" stan-popup="create-delegation">New
                  delegation
                </button>
                <div id="delegations-overview" stan-component="delegations-overview" className="delegation-items"></div>
                <div className="unclaimed-staking-rewards"></div>
                <button className="popup-trigger popup-trigger--password-confirm--claim-staking"
                        stan-popup="password-confirm--claim-staking">Claim rewards
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
