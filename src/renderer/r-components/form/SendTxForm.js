import React from "react";
import Modal from "../modal/Modal";
import PassConfirmForm from "./PassConfirmForm";
import ipcRenderer from 'electron'

class SendTxForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
      amount: ''
    }

    this.handleChangeAddress = this.handleChangeAddress.bind(this)
    this.handleChangeAmount = this.handleChangeAmount.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.sendTx = this.sendTx.bind(this)
  }
  //
  // componentDidMount() {
  //
  // }

  handleChangeAddress(event) {
    this.setState({address: event.target.value});
  }

  handleChangeAmount(event) {
    this.setState({amount: event.target.value});
  }

  handleSubmit(event) {
    window.Modal.show()
    event.preventDefault()
  }

  sendTx(password) {
    // Process tx
    ipcRenderer.send('send-tx', [this.state.address, this.state.amount, password])
  }

  render() {
    return (
      <form id="form--send-tx" onSubmit={this.handleSubmit}>
        <div className="sucs-msg status-msg"></div>
        <div className="err-msg status-msg"></div>
        <div className="form-item form-item--address form-item-icon form-item-icon--send">
          <label htmlFor="address">Send to</label>
          <input id="address" type="text" placeholder="Address" value={this.state.address} onChange={this.handleChangeAddress} required></input>
          <div className="popup-trigger popup-trigger--address-book icon-btn icon-address-book"
               stan-popup="address-book"></div>
          <div className="address-book-annotation"></div>
        </div>
        <div className="form-item form-item--amount form-item-icon form-item-icon--currency">
          <label htmlFor="amount">Amount</label>
          <input id="amount" type="number" placeholder="0.00" step="0.001" value={this.state.amount} onChange={this.handleChangeAmount} required></input>
        </div>
        <div className="gas-estimate">
          <span className="label">Transaction fee:</span>
          <span className="value">0.000001 STAN</span>
        </div>
        <input type="submit" value="Send funds"/>
        <Modal ref={(Modal) => {window.Modal = Modal}}>
          <PassConfirmForm callback={this.sendTx} />
        </Modal>
      </form>
    );
  }
}

export default SendTxForm