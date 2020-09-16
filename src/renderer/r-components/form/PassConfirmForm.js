import React from "react";
import Modal from "../modal/Modal";

class PassConfirmForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      password: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.confirm = this.confirm.bind(this)
  }

  handleChange(e) {
    this.setState({password: e.target.value})
  }

  confirm() {
    // @TODO check pwd here

    this.props.callback(this.state.password)
  }

  render() {
    return (
      <form id="form--password-confirm" onSubmit={this.confirm}>
        <div className="sucs-msg status-msg"></div>
        <div className="err-msg status-msg"></div>
        {/*<div className="tx-summary">*/}
        {/*  <div className="label"></div>*/}
        {/*  <div className="address"></div>*/}
        {/*  <div className="amount"></div>*/}
        {/*</div>*/}
        <div className="form-item form-item--password form-item-icon form-item-icon--keylock">
          <input type="password" placeholder="Password" onChange={this.handleChange} required />
        </div>
        <div className="form-actions align-right">
          <input className="btn-small" type="submit" value="Confirm transaction"/>
        </div>
      </form>
    );
  }
}

export default PassConfirmForm