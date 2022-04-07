import React, { Component } from 'react'

class Audio extends Component {
  constructor(props) {
    super(props);
    this.audioTag = React.createRef();
  }

  setStream = () => {
    if (this.props.stream) {
      this.audioTag.current.srcObject = this.props.stream;
      if (this.props.muted) {
        this.audioTag.current.muted = true;
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.setStream();
    }
  }

  componentDidMount() {
    this.setStream();
  }

  render() {
    return (
      <audio
        ref={this.audioTag}
        autoPlay
      />
    )
  }
}

export default Audio;
