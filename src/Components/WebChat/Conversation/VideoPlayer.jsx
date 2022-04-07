import React from "react";
import videojs from "video.js";
import { calculateWidthAndHeightOffset } from "../../../Helpers/Utility";
import { ChatAudioSender2, ChatAudioRecorder } from "../../../assets/images";

export default class VideoPlayer extends React.Component {
  constructor() {
    super();
    this.state = {
      visibility: false,
      webWidth: 0,
      webHeight: 0,
      palyStatus: true
    };
  }

  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, () => {
      const videoElement = document && document.querySelector(".vjs-tech");
      const parentElement = document && document.getElementById(`video-player-${this.props.msgId}`);
      const captionElement = document && document.getElementById(`video-caption-${this.props.msgId}`);

      if (parentElement) {
        const { offsetWidth, offsetHeight } = parentElement;
        let captionHeight = 0;
        if (captionElement) captionHeight = captionElement.offsetHeight + this.props.captionMargin;
        const { webWidth: newWidth, webHeight: newHeight } = calculateWidthAndHeightOffset(
          this.props.webWidth,
          this.props.webHeight,
          offsetWidth,
          offsetHeight - captionHeight
        );
        this.setState({
          webWidth: newWidth,
          webHeight: newHeight,
          visibility: true
        });
      }
      if (videoElement && this.props.handlePlay) {
        videoElement.addEventListener("play", () => this.props.handlePlay(true));
        videoElement.addEventListener("pause", () => this.props.handlePlay(false));
      }

    });
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  getStyle = () => {
    const { webWidth, webHeight, visibility } = this.state;
    return {
      width: `${webWidth}px`,
      height: `${webHeight}px`,
      visibility: visibility ? "visible" : "hidden"
    };
  };

  _onClick = () => {
    const { palyStatus } = this.state;
    if (palyStatus) {
      this.player.pause();
      this.setState({ palyStatus: false });
    } else {
      this.setState({ palyStatus: true });
      this.player.play();
    }
  };

  myCallback = () => {
    this.setState({ palyStatus: false });
    const elemsData = document.querySelectorAll(".AudioDetails");
    [].forEach.call(elemsData, function (ele) {
      ele.classList.remove("default");
    });
  };

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    const { palyStatus = true } = this.state;
    const { deleteOption = false, msgId, autoPlay, fileType = "", } = this.props;
    return (
      <div
        data-jest-id={"jest_onClick"}
        onClick={fileType === "audio" ? () => this._onClick() : null}
      >

        {fileType === "audio" &&
          <i className={`AudioDetails ${palyStatus === true ? "default" : ""}`}>
            {this.props.audioType !== "recording" ? <ChatAudioSender2 /> : <ChatAudioRecorder />}
            <span className="audioDuration">{this.props.audioDuration}</span>
          </i>}

        { deleteOption &&
          <div className="uploadImagePreview"></div>}
        <div style={this.props.fileType === "video" ? this.getStyle() : {}} data-vjs-player>
          <video
            preload="auto"
            data-msgid={msgId}
            autoPlay={autoPlay}
            className="video-js"
            onEnded={() => this.myCallback()}
            ref={(node) => (this.videoNode = node)}
          ></video>
        </div>
      </div >
    );
  }
}
