import React from 'react'
import ReactDOM from 'react-dom'

const appRoot = document.getElementById('root')

class Modal extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      show: false
    }

    this.hide = this.hide.bind(this)
  }

  show() {
    this.setState({show: true})
  }
  hide() {
    this.setState({show: false})
  }

  render() {
    let is_shown = this.state.show ? 'is-shown' : ''
    return ReactDOM.createPortal(
      <div className={`s-modal ${is_shown}`}>
        <div className="inner sh-block">
          <div className="modal-close popup-close" onClick={this.hide} />
          {/*<h4 className="sh-border">{ this.props.title }</h4>*/}
          { this.props.children }
        </div>
      </div>,
      appRoot,
    )
  }

}

export default Modal