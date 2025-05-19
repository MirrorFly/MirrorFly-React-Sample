import React, { Component } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { AttachmentCamera, AttachmentDoc, AttachmentImageVideo, AttachMusic,
   AttachVideo } from "../../../../../assets/images";
import "./Attachement.scss";
import { blockOfflineMsgAction } from "../../../../../Helpers/Utility";
export default class Attachement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAvailableOptions: true,
      dropStatus: false,
      selectedFiles: [],
      showPreview: false,
      selectedSlide: 0,
      openCamera: false
    };
    document.addEventListener("keydown", this.handleOnKeyPress, false);
  }
  componentDidMount() {
    document.getElementById("msgContent").classList.add("bg-overlay");
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleOnKeyPress, false);
    document.getElementById("msgContent").classList.remove("bg-overlay");
  }

  handleOnKeyPress = (event = {}) => {
    if (event.keyCode === 27) {
      this.props.closeAttachment();
    }
  };

  selectFile = (event, type) => {
    this.props.selectFile(event, type);
  };

  handleFocusBack = () => {
    window.removeEventListener("focus", this.handleFocusBack);
    setTimeout(() => this.props.closeAttachment(), 1000);
  };

  clickedFileInput = (e) => {
    e.target.value = "";
    window.addEventListener("focus", this.handleFocusBack);
  };

  render() {
    let { showAvailableOptions } = this.state;
    const { attachment: { isDocumentAttachmentEnabled = false, isAudioAttachmentEnabled = false,
      isImageAttachmentEnabled = false, isVideoAttachmentEnabled = false,
    } = {} } = this.props;
    return (
      <div>
        <OutsideClickHandler
          onOutsideClick={() => {
            setTimeout(() => {
              this.props.closeAttachment();
            }, 100);
          }}
        >
          {showAvailableOptions && (
            <div className="choose-upload-files">
              <ul className="fileicon">
                {isAudioAttachmentEnabled &&
                  <li>
                    {" "}
                    <div
                      onClick={() => {
                        if (blockOfflineMsgAction()) return;
                        this.audioupload.click();
                        this.setState({ showAvailableOptions: false });
                      }}
                    >
                      <i className="Attach-icon-music">
                        <AttachMusic />
                      </i>
                      <span>Audio</span>
                    </div>
                  </li>
                }
                {isDocumentAttachmentEnabled &&
                  <li>
                    {" "}
                    <div
                      onClick={() => {
                        if (blockOfflineMsgAction()) return;
                        this.documentupload.click();
                        this.setState({ showAvailableOptions: false });
                      }}
                    >
                      <i className="Attach-icon-doc">
                        <AttachmentDoc />
                      </i>
                      <span>Document</span>
                    </div>
                  </li>
                }

{isImageAttachmentEnabled && isVideoAttachmentEnabled && (
                  <li>
                    {" "}
                    <div
                      onClick={() => {
                        if (blockOfflineMsgAction()) return;
                        this.imageVideoupload.click();
                        this.setState({ showAvailableOptions: false });
                      }}
                    >
                      <i className="Attach-icon-videoImage">
                        <AttachmentImageVideo />
                      </i>
                      <span>Photo / Video</span>
                    </div>
                  </li>
                )}

                { isImageAttachmentEnabled && !isVideoAttachmentEnabled && (
                    <li>
                      {" "}
                      <div
                        onClick={() => {
                          if (blockOfflineMsgAction()) return;
                          this.imageUpload.click();
                          this.setState({ showAvailableOptions: false });
                        }}
                      >
                        <i className="Attach-icon-videoImage">
                          <AttachmentImageVideo />
                        </i>
                        <span>Photo </span>
                      </div>
                    </li>
                )}    
                { !isImageAttachmentEnabled && isVideoAttachmentEnabled && (
                  <li>
                    {" "}
                    <div
                      onClick={() => {
                        if (blockOfflineMsgAction()) return;
                        this.videoUpload.click();
                        this.setState({ showAvailableOptions: false });
                      }}
                    >
                      <i className="Attach-icon-videoImage video">
                        <AttachVideo className="top-0" />
                      </i>
                      <span>Video </span>
                    </div>
                  </li>
                )}
                
                {isImageAttachmentEnabled ?
                  <li>
                    {" "}
                    <div onClick={() => {
                      if (blockOfflineMsgAction()) return;
                      this.props.toggleCamera()
                    }}>
                      <i className="Attach-icon-camera">
                        <AttachmentCamera />
                      </i>
                      <span>Camera</span>
                    </div>
                  </li> : null
                }
              </ul>
            </div>
          )}
        </OutsideClickHandler>
        <input
          id="imageVideoInput"
          type="file"
          ref={(ref) => (this.imageVideoupload = ref)}
          style={{ display: "none" }}
          onChange={(e) => this.selectFile(e, "imagevideo")}
          onClick={this.clickedFileInput}
          accept={
            ".webm,.mp4,.x-m4v,.png,.jpeg,.jpg,video/x-m4v,.mov"
          }
          multiple
        />
        <input
          id="imageVideoInput"
          type="file"
          ref={(ref) => (this.imageUpload = ref)}
          style={{ display: "none" }}
          onChange={(e) => this.selectFile(e, "image")}
          onClick={this.clickedFileInput}
          accept={
            ".png,.jpeg,.jpg"
          }
          multiple
        />
        <input
          id="imageVideoInput"
          type="file"
          ref={(ref) => (this.videoUpload = ref)}
          style={{ display: "none" }}
          onChange={(e) => this.selectFile(e, "video")}
          onClick={this.clickedFileInput}
          accept={
            ".webm,.mp4,.x-m4v, video/x-m4v,.mov"
          }
          multiple
        />
        <input
          id="fileInput"
          type="file"
          ref={(ref) => (this.documentupload = ref)}
          style={{ display: "none" }}
          onChange={(e) => this.selectFile(e, "file")}
          onClick={this.clickedFileInput}
          accept={
            ".pdf,.xlsx,.xls,.txt,.doc, .docx, text/plain, .csv, .ppt, .zip, .rar, .pptx"
          }
          multiple
        />
        <input
          id="audioInput"
          type="file"
          ref={(ref) => (this.audioupload = ref)}
          style={{ display: "none" }}
          onChange={(e) => this.selectFile(e, "audio")}
          onClick={this.clickedFileInput}
          accept={
            ".wav,.mp3,.aac"
          }
          multiple
        />
      </div>
    );
  }
}
