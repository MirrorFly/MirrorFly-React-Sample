import React, { Component, Fragment } from "react";
import "video.js/dist/video-js.css";
import { ChatAudioSender2 } from "../../../../assets/images";
import { AUDIO_ACC_WINDOWS } from "../../../../Helpers/Chat/Constant";
import { millisToMinutesAndSeconds } from "../../../../Helpers/Utility";
import VideoPlayer from "../../Conversation/VideoPlayer";

export default class PreviewAudio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoSrc: "",
      duration: 0,
      isPlaying: false
    };
  }

  setFileInfo = (file) => {
    let htmlElement = document.createElement("audio");
    htmlElement.preload = "metadata";
    htmlElement.addEventListener("loadedmetadata", () => {
      this.setState(
        {
          videoSrc: URL.createObjectURL(file) || htmlElement.src
        },
        () => {
          this.props.updateMedia(this.props.media, {
            duration: Math.round(htmlElement.duration * 1000),
            imageUrl: htmlElement.src,
            msgType: "audio",
            audioType:"file"
          });
          this.setState({ duration: Math.round(htmlElement.duration * 1000) });
        }
      );
    });
    htmlElement.src = URL.createObjectURL(file);
  };

  componentDidMount() {
    this.setFileInfo(this.props.media);
  }

  componentWillUnmount() {
    window.URL.revokeObjectURL(this.state.videoSrc);
  }

  videoControls = () => {
    return {
      autoplay: false,
      controls: true,
      sources: [
        {
          src: this.state.videoSrc,
          type: this.props.media.type === AUDIO_ACC_WINDOWS ? "audio/aac" : this.props.media.type
        }
      ]
    };
  };

  handleDelete = () => {
    this.props.onClickCloseSelectedItem(this.props.media);
  };

  onHandlePlay = (playState) => {
    this.setState({ isPlaying: playState });
  };

  render() {
    const { videoSrc, isPlaying } = this.state;
    if (!videoSrc) return null;
    return (
      <Fragment>
        <div className="type-media audio">
          <div className="video-wrapper1">
            <i className={`AudioDetails ${!isPlaying && "default"}`}>
              <ChatAudioSender2 />{" "}
              <span className="audioDuration">{millisToMinutesAndSeconds(this.state.duration)}</span>
            </i>
            <VideoPlayer
              deleteOption={true}
              onClickCloseSelectedItem={this.handleDelete}
              {...this.videoControls()}
              handlePlay={this.onHandlePlay}
              fileType={"audio"}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}
