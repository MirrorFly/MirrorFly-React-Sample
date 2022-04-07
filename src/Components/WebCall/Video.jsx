import React, { Component } from 'react'

class Video extends Component {
    constructor(props) {
      super(props);
      this.videoTag = React.createRef()
    }

    setStream = () => {
      if(this.props.stream){
          this.videoTag.current.srcObject = this.props.stream;
          if(this.props.muted){
            this.videoTag.current.muted = true;
          }
      }
    }

    componentDidUpdate(prevProps){
      if(prevProps.id !== this.props.id){
        this.setStream();
      }
    }

    componentDidMount() {
      this.setStream();
    }

    render() {
      return (
        <video
          id={this.uniqueId}
          ref={this.videoTag}
          playsInline
          autoPlay
          style={this.props.inverse ? {transform: "scaleX(-1)"} : {}}
        />
      )
    }
}

export default Video;
