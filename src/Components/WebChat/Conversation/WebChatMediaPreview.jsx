import React, { Fragment, Suspense } from "react";
import { connect } from "react-redux";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "react-videoplayer/lib/index.css";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import "video.js/dist/video-js.css";
import {
  AudioFile,
  PreviewClose,
  ZoomIn,
  ZoomOut,
  ZoomRestore,
  AudioRecord,
  PreviewStar,
  PreviewForward,
  PreviewDownload,
  PreviewChat,
  PreviewStarActive
} from "../../../assets/images";
import "../../../assets/scss/image-gallery-custom.scss";
import IndexedDb from "../../../Helpers/IndexedDb";
import SDK from "../../SDK";
import VideoPlayer from "./VideoPlayer";
import { getExtension } from "../../WebChat/Common/FileUploadValidation";
import getFileFromType from "./Templates/Common/getFileFromType";
import {
  getDbInstanceName,
  getThumbBase64URL,
  millisToMinutesAndSeconds
} from "../../../Helpers/Utility";
import {
  downloadMediaFile,
  formatBytes,
  getActiveChatMessages,
} from "../../../Helpers/Chat/ChatHelper";
import { INITIAL_LOAD_MEDIA_LIMIT, LOAD_MORE_MEDIA_LIMIT, PREVIEW_MEDIA_TYPES } from "../../../Helpers/Constants";
import { formatUserIdToJid } from "../../../Helpers/Chat/User";
import Spinner from "./Templates/Common/Spinner";

const CAPTION_MARGIN = 30;
class WebChatMediaPreview extends React.Component {
  constructor() {
    super();
    this.state = {
      mediaList: [],
      previewData: [],
      selectedItem: 0,
      loadMore: false,
      lastTranslateX: false,
      isPlaying: false,
      palyStatus: true,
      NeedDevelopment: false,
      favouriteMsgs: {},
      starStatusCheck: false,
      allowInitialCall: false,
      seletedMsgId: "",
    };
    this.tempSelectedItem = 0;
    this.localDb = new IndexedDb();
    this.myAudioElemet = React.createRef();

    document.addEventListener("keydown", this.handleOnKeyPress, false);
  }

  getFile = async (fileToken, type, thumbImage, fileKey) => {
    if (!fileToken) return null;
    if (type === "video") {
      const mediaResponse = await SDK.getMediaURL(fileToken, fileKey);
      if (mediaResponse.statusCode === 200) {
        return mediaResponse.data.blobUrl; 
      } else {
        console.log("error in loading media file");
        return "";
      }
    } else {
      return this.localDb
      .getImageByKey(fileToken, getDbInstanceName(type), fileKey)
      .then((blob) => {
        return window.URL.createObjectURL(blob);
      })
      .catch(() => thumbImage);
    }
  };

  handleDisplayMedia = async () => {
    return Promise.allSettled(
      this.state.mediaList.map(async (media, index) => {
        let audioType = media?.msgBody?.media?.audioType;
        let msgObj = media.msgBody ? media.msgBody : media;
        let {
          message_type,
          media: {
            fileName = null,
            file_url = null,
            file_key = null,
            file_size = null,
            caption = null,
            thumb_image = null,
            duration = null,
            is_uploading = 2,
            originalWidth,
            originalHeight
          } = {}
        } = msgObj;
        let { msgId } = media;

        const fileSize = formatBytes(file_size);
        thumb_image = getThumbBase64URL(thumb_image);
        let mediaData = {};
        const fileExtension = getExtension(fileName);
        const placeholder = getFileFromType(null, fileExtension);

        switch (message_type) {
          case "image":
            const imageSrc = is_uploading === 1 ? file_url : await this.getFile(file_url, "image", thumb_image, file_key);
            if (!imageSrc || imageSrc === "") {
              break;
            }
            mediaData = {
              class: "type-image",
              imageURL: imageSrc,
              fileName: fileName,
              media: (
                <>
                  <div className="imageZoomWrapper">
                    <TransformWrapper>
                      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                        <React.Fragment>
                          <div className="tools zoomTools">
                            <button onClick={zoomIn}>
                              <ZoomIn />

                            </button>
                            <button onClick={zoomOut}>
                              <ZoomOut />
                            </button>
                            <button onClick={resetTransform}>
                              <ZoomRestore />
                            </button>
                          </div>
                          <TransformComponent>
                            <img src={imageSrc} alt="" />
                          </TransformComponent>
                        </React.Fragment>
                      )}
                    </TransformWrapper>
                  </div>
                  {caption ? <p className="legend image-caption">{caption}</p> : ""}
                </>
              )
            };
            break;

          case "file":
            mediaData = {
              class: "type-image file",
              imageURL: placeholder,
              media:
                fileName && fileSize ? (
                  <div className="type-thumb-image">
                    <p className="legend document-name">{`${fileName} , ${fileSize}`}</p>
                  </div>
                ) : (
                    ""
                  )
            };
            break;

          case "audio":
            const audioSrc = is_uploading === 1 ? file_url : await this.getFile(file_url, "audio", {}, file_key);
            if (!audioSrc || audioSrc === "") {
              break;
            }
            mediaData = {
              class: "type-media audio",
              imageURL: audioType !== "recording" ? AudioFile : AudioRecord,
              media: (
                <div className="video-wrapper1" duration={millisToMinutesAndSeconds(duration)}>
                  <VideoPlayer
                    {...this.videoControls(audioSrc, msgId, this.props.selectedMessageData.msgId === msgId)}
                    fileType={"audio"}
                    handlePlay={this.handlePlayPause}
                    audioDuration={millisToMinutesAndSeconds(duration)}
                    audioType={audioType}
                    palyStatus={this.state.palyStatus}
                  />
                </div>
              )
            };
            break;

          case "video":
            const videoSrc = is_uploading === 1 ? file_url : await this.getFile(file_url, "video", {}, file_key);
            if (!videoSrc || videoSrc === "") {
              break;
            }
            mediaData = {
              class: "type-media video",
              imageURL: thumb_image,
              media: (
                <div className="video-wrapper1" id={`video-player-${msgId}`}>
                  <VideoPlayer
                    {...this.videoControls(
                      videoSrc,
                      msgId,
                      this.props.selectedMessageData.msgId === msgId,
                      thumb_image
                    )}
                    palyStatus={this.state.palyStatus}
                    webWidth={originalWidth}
                    webHeight={originalHeight}
                    captionMargin={CAPTION_MARGIN}
                    index={index}
                    fileType={"video"}
                  />
                  {caption ? (
                    <p
                      className="legend image-caption"
                      id={`video-caption-${msgId}`}
                      style={{ minHeight: "70px", marginTop: `${CAPTION_MARGIN}px` }}
                    >
                      {caption}
                    </p>
                  ) : (
                      ""
                    )}
                </div>
              )
            };
            break;

          default:
            mediaData = {};
            break;
          }
        return (
          <div key={msgId} className={mediaData.class} id={msgId + index}>
            <img src={mediaData.imageURL} alt={mediaData.fileName} />
            {mediaData.media}
          </div>
        );
      })
    );
  };

  handleOnKeyPress = (event) => {
    switch (event.keyCode) {
      case 27:
        this.props.handleMediaClose();
        break;
      case 37:
        this.Previous && this.Previous.click();
        break;
      case 39:
        this.Next && this.Next.click();
        break;
      default:
        break;
    }
  };

  handleOnKeyPress = (event = {}) => {
    switch (event.keyCode) {
      case 27:
        this.props.handleMediaClose();
        break;
      case 37:
        this.Previous && this.Previous.click();
        break;
      case 39:
        this.Next && this.Next.click();
        break;
      default:
        break;
    }
    return true;
  };

  handleDeleteMedia = () => {
    let deleteItem = this.state.mediaList.findIndex((el) => el.msgId === this.props.messageData.data.msgId);
    const newMediaList = [...this.state.mediaList];
    newMediaList.splice(deleteItem, 1);

    this.setState(
      {
        mediaList: newMediaList
      },
      () => {
        this.diplayMedia("delete");
      }
    );
  };

  diplayMedia = (type = "") => {
    let media = [];
    this.handleDisplayMedia().then((results) => results.forEach((result) => {
      if(result.status === "fulfilled"){
        media.push(result.value);
      }
    }))
    .then(() => {
      this.setState({
        previewData: media,
        ...(type === "delete" && {
          selectedItem: this.tempSelectedItem !== 0 ? this.tempSelectedItem - 1 : this.tempSelectedItem
        }),
        ...(type === "add" && {
          selectedItem: this.tempSelectedItem + 1
        })
      });
    })
  };
  
  handleGetMedia = async (messageId = "") => {
    const { jid: msgFrom, chatType } = this.props;
    if (chatType === "broadcast") {
      let jid = formatUserIdToJid(msgFrom);
      SDK.getBroadcastChatMedia(jid, messageId);
    } else {
      let jid = formatUserIdToJid(msgFrom, chatType);
      const mediaMsgRes = await SDK.getMediaMessages(jid, messageId);
      if (mediaMsgRes && mediaMsgRes.statusCode === 200 && mediaMsgRes.data.length) {
        // Filtering Media Duplicates with Message Id
        const msgIds = new Set(this.state.mediaList.map((d) => d.msgId));
        const newList = [
          ...this.state.mediaList,
          ...mediaMsgRes.data.filter((d) => !msgIds.has(d.msgId) && PREVIEW_MEDIA_TYPES.includes(d.message_type))
        ];
        newList.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        this.setState({ mediaList: newList, loadMore: false }, () => this.diplayMedia());
      }
    }
  };

  loadMoreMedia = () => {
    let newMediaList = this.state.mediaList;
    let lastMsgId = newMediaList[newMediaList.length - 1]?.msgId;
    lastMsgId && this.handleGetMedia(lastMsgId);
  };
  handlePlayPause = (value = true) => {
    this.setState({ palyStatus: value });
  };

  handleMediaOnChange = (index, item) => {
    const dataMsgIdValue = item?.props?.id || "";
    const removeLastIndexValue = dataMsgIdValue.slice(0, -1);
    if (removeLastIndexValue) {
      const { starredMessages: { data = [] } = {} } = this.props;
      const checkInitalStar = data.some((ele) => ele.msgId === removeLastIndexValue);
      this.setState({ starStatusCheck: checkInitalStar, seletedMsgId: removeLastIndexValue })
    }
    this.tempSelectedItem = index;
    // Load Next Pagination on Media Slide/Selection
    // And Also if its has Load More i.e. If the Previous "Load More Media" has Data
    if (index >= this.state.mediaList.length - LOAD_MORE_MEDIA_LIMIT && !this.state.loadMore) {
      this.setState({ loadMore: true });
      this.loadMoreMedia();
    }
    const elems = document && document.querySelectorAll && document.querySelectorAll(".AudioDetails");
    [].forEach.call(elems, function (el) {
      el.classList.add("default");
      el.classList.remove("playAudio");
    });
    document
      .getElementById("imagePreviewContainer")
      .querySelectorAll("video, audio")
      .forEach((element) => {
        if (element) {
          let dataMsgId = element.getAttribute("data-msgid");
          if (dataMsgId && dataMsgId + index === item.props.id) {
            element.play();
          } else {
            element.currentTime = 0;
            element.pause();
          }
        }
      });
  };

  getTransformMatrix = (targetThumb) => {
    const style = targetThumb.style.getPropertyValue("transform");
    return new DOMMatrixReadOnly(style);
  };

  setTransformMatrix = (targetThumb, matrixM41) => {
    targetThumb.style = `transform: translate3d(${Math.abs(matrixM41)}px, 0, 0)`;
    this.setState({ lastTranslateX: matrixM41 });
  };

  // Implemented to Handle the Style Change on Thumb Slider in react-responsive-carousel Plugin
  // Since this Plugin Doesn't Support Right to Left, We are Overwrtting Few Default Logics
  // Eg: Converting the Negative Value of Translate to Positive Value
  handleStyleChange = (targetThumb) => {
    const { m41: initialM41 } = this.getTransformMatrix(targetThumb);
    this.setTransformMatrix(targetThumb, initialM41);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutationRecord) => {
        const { m41: newM41 } = this.getTransformMatrix(mutationRecord.target);
        if (this.state.lastTranslateX !== newM41 && newM41) {
          this.setTransformMatrix(targetThumb, newM41);
        }
      });
    });
    mutationObserver.observe(targetThumb, { attributes: true, attributeFilter: ["style"] });
  };

  initializeMutation = () => {
    let thumbInterval = setInterval(() => {
      const targetThumb = document.querySelector(".thumbs.animated");
      if (targetThumb) {
        this.handleStyleChange(targetThumb);
        clearInterval(thumbInterval);
        thumbInterval = 0;
      }
    }, 100);
  };

  componentDidMount() {
    this.initializeMutation();
    const chatMediaList = getActiveChatMessages();
    let mediaList = chatMediaList.filter(
      (el) => el && el.msgBody && PREVIEW_MEDIA_TYPES.includes(el.msgBody.message_type) && el.deleteStatus === 0
    );
    if (mediaList.length) {
      mediaList.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
      let selectedItem = mediaList.findIndex((el) => el.msgId === this.props.selectedMessageData.msgId);
      this.tempSelectedItem = selectedItem;
      
      this.setState({ mediaList, selectedItem }, () => {
        this.diplayMedia();
        // Load More Data if the Inital Fetched Media Count is Less than the Config Value
        selectedItem <= INITIAL_LOAD_MEDIA_LIMIT && this.loadMoreMedia();
      });
      if(this.state.previewData.length === 0){this.failedComponentDidMount()}
    } else{
      this.handleGetMedia();
      if(this.state.previewData.length === 0){this.failedComponentDidMount()} 
    }
  }

  initialCall = () => {
    const { mediaList = [], allowInitialCall = false, selectedItem = 0 } = this.state;
    const { starredMessages: { data = [] } = {} } = this.props;
    if (mediaList.length > 0 && !allowInitialCall) {
      const checkInitalStar = data.some((ele) => ele.msgId === mediaList[selectedItem].msgId)
      this.setState(
        {
          allowInitialCall: true,
          starStatusCheck: checkInitalStar,
          seletedMsgId: mediaList[selectedItem].msgId,
        })
    }
  };

  componentDidUpdate(prevProps, prevState) {
    this.initialCall();

    if (prevProps.messageData.id !== this.props.messageData.id) {
      if (
        this.props.messageData.data &&
        (this.props.messageData.data.msgType === "recallMessage" ||
          this.props.messageData.data.msgType === "carbonRecallMessage" ||
          this.props.messageData.data.clearType === "delete_message")
      ) {
        this.handleDeleteMedia();
      }

      // if (this.props.messageData.data && this.props.messageData.data.msgType === "receiveMessage") {
      //   if (this.props.messageData.data.fromUserId === getUserIdFromJid(this.props.jid)) {
      //     const { msgBody = {} } = this.props.messageData.data;
      //     if (isMediaMessage(msgBody)) {
      //       let newMediaList = this.state.mediaList;
      //       newMediaList.unshift(this.props.messageData.data);
      //       this.setState({ mediaList: newMediaList }, () => this.diplayMedia("add"));
      //       this.initializeMutation();
      //     }
      //   }
      // }
    }
    if (prevProps.groupsData && prevProps.groupsData.id !== this.props.groupsData.id) {
          const groupId = this.props.jid.split("@")[0]
          let currentGroupData = this.props.groupsData?.data.find((item)=> item?.groupId === groupId )
            if(currentGroupData?.isAdminBlocked){
              return this.props.handleMediaClose()
            }
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleOnKeyPress, false);
  }

  imageOnLoad = (e) => {
    e.target.classList.remove("image-load");
    e.target.style.display = "block";
  };

  customRenderThumb = (children) =>
    children.map((item, index) => {
      const url = item.props?.children[0]?.props?.src;
      const duration = item.props?.children[1]?.props?.duration;
      const videoIcon = item.props?.className === "type-media video" ? "video-icon" : "";
      const FileIcon = item.props?.className === "type-image file" ? "File" : "";
      return (
        <div key={index} className={`thumb-img ${videoIcon || FileIcon} img-load`}>
          <img
            src={url}
            key={`${index}-Img`}
            alt=""
            onLoad={this.imageOnLoad}
            className="image-load"
            style={{ display: "none" }}
          />
          <Spinner />

          {duration && (
            <p className="audio-duration" key={`${index}-Duration`}>
              {duration}
            </p>
          )}
        </div>
      );
    });

  handlePrev = (onClickHandler, hasPrev) => {
    return (
      hasPrev && (
        <button
          type="button"
          onClick={onClickHandler}
          title="Previous"
          ref={(input) => (this.Previous = input)}
          aria-label="previous slide / item"
          className="control-arrow control-prev"
        ></button>
      )
    );
  };

  handleNext = (onClickHandler, hasNext) => {
    return (
      hasNext && (
        <button
          type="button"
          onClick={onClickHandler}
          ref={(input) => (this.Next = input)}
          title="Next"
          aria-label="next slide / item"
          className="control-arrow control-next"
        ></button>
      )
    );
  };

  videoControls = (fileUrl, msgId, selectedMedia, thumbImage) => {
    return {
      autoplay: selectedMedia,
      msgId: msgId,
      controls: true,
      sources: [
        {
          src: fileUrl,
          type: "video/mp4"
        }
      ],
      poster: thumbImage
    };
  };

  getSelectedMsgObj = () => {
    if (this.tempSelectedItem > -1 && this.state.mediaList.length > 0) {
      return this.state.mediaList[this.tempSelectedItem] || {};
    }
    return {};
  };

  downloadFile = () => {
    if (this.tempSelectedItem > -1 && this.state.mediaList.length > 0) {
      const selectedMediaData = this.state.mediaList[this.tempSelectedItem];
      if (selectedMediaData && Object.keys(selectedMediaData).length > 0) {
        const { msgBody: { media: { file_url, fileName: file_name, file_key } = {}, message_type = "" } = {} } =
          selectedMediaData;
        const fileName = message_type === "file" ? file_name : "";
        downloadMediaFile(file_url, message_type, fileName, file_key);
      }
    }
  };

  getSelectedMsgId = () => {
    const selectedMedia = this.getSelectedMsgObj();
    if (selectedMedia && Object.keys(selectedMedia).length > 0) {
      return selectedMedia.msgId;
    }
    return "";
  };

  getSelectedFavouriteStatus = () => {
    const selectedMedia = this.getSelectedMsgObj();
    if (selectedMedia && Object.keys(selectedMedia).length > 0) {
      const { favouriteMsgs } = this.state;
      const localFavStatus = favouriteMsgs[selectedMedia.msgId];
      return localFavStatus !== undefined ? localFavStatus : selectedMedia.favouriteStatus;
    }
    return 0;
  };

  handleStarMessage = async () => {
    const { starStatusCheck = false, seletedMsgId = "" } = this.state;
    SDK.updateFavouriteStatus(formatUserIdToJid(this.props.jid), [seletedMsgId], !starStatusCheck);
    this.setState({ starStatusCheck: !starStatusCheck })
  };
  
  failedComponentDidMount(){
    this.initializeMutation();
    const chatMediaList = getActiveChatMessages();
    let mediaList = chatMediaList.filter(
      (el) => el && el.msgBody && PREVIEW_MEDIA_TYPES.includes(el.msgBody.message_type) && el.deleteStatus === 0
    );
    if (mediaList.length) {
      mediaList.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
      let selectedItem = mediaList.findIndex((el) => el.msgId === this.props.selectedMessageData.msgId);
      this.tempSelectedItem = selectedItem;
      
      this.setState({ mediaList, selectedItem }, () => {
        this.diplayMedia();
        // Load More Data if the Inital Fetched Media Count is Less than the Config Value
        selectedItem <= INITIAL_LOAD_MEDIA_LIMIT && this.loadMoreMedia();
      });
    } else{
      this.handleGetMedia();
    } 
  }

  render() {
    const { previewData, selectedItem, starStatusCheck = false } = this.state;
    return (
      <Suspense
        fallback={<div>Loading...</div>}>
        <Fragment>
          <div>
            <div
              className="imagePreviewContainer imagePreviewWrapper"
              id="imagePreviewContainer"
              ref="imagePreviewContainer"
            >
              <div className="preview-options">
                <ul>
                  <li>
                    <i className="" title="Download" onClick={this.downloadFile}>
                      <PreviewDownload />
                    </i>
                  </li>

                  <li
                    onClick={() => this.handleStarMessage()}>
                    <i
                      className="icon-star"
                      title={starStatusCheck === true ? "Star" : "Unstar"}
                    >
                      <PreviewStar fill="#fff"
                        id={"starFillId"}
                        style={{ display: starStatusCheck ? "none" : "inline-block" }}
                      />
                      <PreviewStarActive
                        id={"starFillId"}
                        style={{ display: starStatusCheck ? "inline-block" : "none" }}
                      />
                    </i>
                  </li>

                  {this.state.NeedDevelopment && (
                    <>
                      <li>
                        <i className="" title="Find in Chat">
                          <PreviewChat />
                        </i>
                      </li>
                      <li>
                        <i className="" title="Forward">
                          <PreviewForward />
                        </i>
                      </li>
                    </>
                  )}
                  <li>
                    <i className="preview-close" title="Close" onClick={this.props.handleMediaClose}>
                      <PreviewClose />
                    </i>
                  </li>
                </ul>
              </div>
              {previewData.length && (
                <Carousel
                  key={this.state.mediaList[0].msgId}
                  renderArrowPrev={this.handleNext} // For Handling Right to Left Slide, We are Revering the Logic
                  renderArrowNext={this.handlePrev}
                  selectedItem={selectedItem}
                  onChange={this.handleMediaOnChange}
                  onClickThumb={this.handleMediaOnChange}
                  renderThumbs={this.customRenderThumb}
                  transitionTime="10"
                  thumbWidth="120"
                  swipeable={false}
                >
                  {previewData}
                </Carousel>
              )}
            </div>
          </div>
        </Fragment>
      </Suspense>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    messageData: state.messageData,
    starredMessages: state.starredMessages,
    groupsData:state.groupsData
  };
};

export default connect(mapStateToProps, null)(WebChatMediaPreview);