import React from 'react'


class Section extends React.Component {
  render() {
    return(
      <section id={this.props.id} className="app-section section-default">
        <div className="inner">
          { this.props.children }
        </div>
      </section>
    )
  }

}

export default Section