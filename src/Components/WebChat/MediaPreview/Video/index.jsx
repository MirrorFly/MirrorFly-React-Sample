import React, { Component, Fragment } from "react";
import "video.js/dist/video-js.css";
import VideoPlayer from "../../Conversation/VideoPlayer";
import Caption from "../Caption";
import { calculateWidthAndHeight } from "../../../../Helpers/Utility";
import { MIN_THUMB_WIDTH } from "../../../../Helpers/Constants";

const CAPTION_MARGIN = 0;
export default class PreviewVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoSrc: URL.createObjectURL(props.media),
      originalWidth: 0,
      originalHeight: 0,
      uniqueId: Date.now()
    };
  }

  setFileInfo = (file) => {
    const video = document.createElement("video");
    video.addEventListener("error", (ex) => {
      console.log("error when loading video file", ex);
    });
    video.addEventListener("loadeddata", () => {
      const canvas = document.createElement("canvas");
      this.setState({ originalWidth: video.videoWidth, originalHeight: video.videoHeight });
      const { webWidth, webHeight, androidWidth, androidHeight } = calculateWidthAndHeight(
        video.videoWidth,
        video.videoHeight
      );
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = MIN_THUMB_WIDTH;
      canvas.height = (height / width) * MIN_THUMB_WIDTH;
      canvas.getContext("2d").drawImage(video, 0, 0, MIN_THUMB_WIDTH, (height / width) * MIN_THUMB_WIDTH);
      const image = canvas.toDataURL();
      const thumb = image.replace(/^data:image\/\w+;base64,/, "");
      this.props.updateMedia(this.props.media, {
        duration: Math.round(video.duration * 1000),
        imageUrl: thumb,
        msgType: "video",
        webWidth,
        webHeight,
        androidWidth,
        androidHeight,
        originalWidth: video.videoWidth,
        originalHeight: video.videoHeight
      });
    });
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.play();
  };

  videoControls = () => {
    return {
      autoplay: false,
      controls: true,
      sources: [
        {
          src: this.state.videoSrc,
          type: this.props.media.type
        }
      ]
    };
  };

  handleDelete = () => {
    this.props.onClickCloseSelectedItem(this.props.media);
  };

  componentWillUnmount() {
    URL.revokeObjectURL(this.state.videoSrc);
  }

  componentDidMount() {
    this.setFileInfo(this.props.media);
  }

  render() {
    const { originalWidth, originalHeight } = this.state;
    return (
      <Fragment>
        <div className="type-media video">
          <div className="video-wrapper-0">
            {originalWidth !== 0 && originalHeight !== 0 && (
              <div className="video-wrapper1" id={`video-player-${this.state.uniqueId}`}>
                <VideoPlayer
                  deleteOption={true}
                  onClickCloseSelectedItem={this.handleDelete}
                  {...this.videoControls()}
                  webWidth={originalWidth}
                  webHeight={originalHeight}
                  msgId={this.state.uniqueId}
                  captionMargin={CAPTION_MARGIN}
                  fileType={"video"}
                />
              </div>
            )}
          </div>
          <Caption
            onChangeCaption={this.props.onChangeCaption}
            media={this.props.media}
            onClickSend={this.props.onClickSend}
            uniqueId={this.props.uniqueId}
            selectedFiles={this.props.selectedFiles}
            chatType={this.props.chatType}
            chatId={this.props.chatId}
            newFile={this.props.type}
          />
        </div>
      </Fragment>
    );
  }
}
