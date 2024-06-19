import React, { Fragment, Suspense } from "react";
import { connect } from "react-redux";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
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
import Store from "../../../Store";
import { MediaDownloadDataAction } from "../../../Actions/Media";
import "./Templates/Common/Spinner/Spinner.scss"

const CAPTION_MARGIN = 30;
class WebChatMediaPreview extends React.Component {
  constructor() {
    super();
    this.state = {
      mediaList: [],
      previewData: [],
      previewLoadedVideosIndex:[],
      previewLoadedImagesIndex:[],
      previewLoadedAudioIndex:[],
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
      viewAllMedias: true,
      selectedMediaIndex: 0,
      previewLoading: true,
      initialRender: false,
    };
    this.tempSelectedItem = 0;
    this.localDb = new IndexedDb();

    document.addEventListener("keydown", this.handleOnKeyPress, false);
  }

  getFile = async (msgId, fileToken, type, thumbImage, fileKey, fileExtensionSlice) => {
    if (!fileToken) return null;
    return new Promise(async(resolve, reject) => {
      if (type === "video") {
        await SDK.downloadMedia(msgId, () => {
        }, (response) => {
          Store.dispatch(MediaDownloadDataAction({ msgId, progress: null }));   
          resolve(response.blobUrl);
        }, () => {
          console.log("error in loading media file");
          resolve("");
        });
      } else {
          this.localDb
          .getImageByKey(fileToken, getDbInstanceName(type), fileKey, msgId)
          .then((blob) => {
            const dbBlob = new Blob([blob], { type: type + "/" + fileExtensionSlice });
            const blobUrl = window.URL.createObjectURL(dbBlob)
            resolve(blobUrl);
          })
          .catch(() => thumbImage);
      }
    });
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
        let temp;
        if(caption !== null){
          temp = document.createElement("div");
          temp.innerHTML = caption;
        }

        const fileSize = formatBytes(file_size);
        thumb_image = getThumbBase64URL(thumb_image);
        let mediaData = {};
        const fileExtension = getExtension(fileName);
        const placeholder = getFileFromType(null, fileExtension);
        const fileExtensionSlice = fileExtension.split(".")[1]

        switch (message_type) {
          case "image":
            let imageUrl = thumb_image;
            if (this.state.initialRender && index === this.tempSelectedItem) {
              imageUrl = is_uploading === 1 ? file_url : await this.getFile(msgId, file_url, "image", thumb_image, file_key, fileExtensionSlice);
            }
            if (!imageUrl || imageUrl === "") {
              break;
            }
            mediaData = {
              class: "type-image",
              imageURL: thumb_image,
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
                            <img src={imageUrl} alt="" />
                            {imageUrl.search("blob:") === -1 && (
                              <div style={{ zIndex: 3 }}>
                                <div className="spiner" style={{ display: "flex", alignItems: "center" }}>
                                  <div className="spin"></div>
                                </div>
                              </div>
                            )}
                          </TransformComponent>
                        </React.Fragment>
                      )}
                    </TransformWrapper>
                  </div>
                  {caption ? <p className="legend image-caption">{temp.textContent}</p> : ""}
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
            let audioSrc;
            if(this.state.initialRender && index === this.tempSelectedItem ){
              audioSrc = is_uploading === 1 ? file_url : await this.getFile(msgId, file_url, "audio", {}, file_key, fileExtensionSlice);
            }
            mediaData = {
              class: "type-media audio",
              imageURL: audioType !== "recording" ? AudioFile : AudioRecord,
              media: (
                <div className="video-wrapper1" duration={millisToMinutesAndSeconds(duration)}>
                  {audioSrc ? (
                    <VideoPlayer
                      {...this.videoControls(audioSrc, msgId, this.props.selectedMessageData.msgId === msgId)}
                      fileType={"audio"}
                      handlePlay={this.handlePlayPause}
                      audioDuration={millisToMinutesAndSeconds(duration)}
                      audioType={audioType}
                      palyStatus={this.state.palyStatus}
                    />
                  ) : (
                    <>
                     <img src={audioType !== "recording" ? AudioFile : AudioRecord} alt={audioType !== "recording" ? AudioFile : AudioRecord} style={{ height: originalHeight, width: "1000px" }}
                      className="previewVideoThumbnail" />
                      <div style={{zIndex:3}}>
                      <div className="spiner" style={{display:"flex", alignItems:"center"}}>
                        <div className="spin"></div>
                      </div>
                      </div>
                    </>
                  )}
                </div>
              )
            };
            break;

          case "video":
            if (this.state.initialRender && index === this.tempSelectedItem) {
              const videoSrc = is_uploading === 1 ? file_url : await this.getFile(msgId, file_url, "video", {}, file_key, fileExtensionSlice);
              if (!videoSrc || videoSrc === "") {
                break;
              }
              mediaData = {
                class: "type-media videos",
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
                        {temp.textContent}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                )
              };
            }
            else {
              mediaData = {
                class: "type-media videosThumb",
                imageURL: thumb_image,
                media: (
                  <div className="video-wrapper1" id={`video-player-${msgId}`}>
                    <img src={thumb_image} alt={thumb_image} style={{ height: originalHeight, width: "1000px" }}
                      className="previewVideoThumbnail" />
                      <div style={{zIndex:3}}><Spinner /></div>
                    {caption ? (
                      <p
                        className="legend image-caption"
                        id={`video-caption-${msgId}`}
                        style={{ minHeight: "70px", marginTop: `${CAPTION_MARGIN}px` }}
                      >
                        {temp.textContent}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                )
              };
            }
            break;

          default:
            mediaData = {};
            break;
        }
        return (
          <div key={msgId} className={mediaData.class} id={msgId}>
            <img style={{display:"none"}} src={mediaData.imageURL} className="data" alt={mediaData.fileName} />
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
    this.handleDisplayMedia().then((results) => results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        media.push(result.value);
        if(!this.state.initialRender){
          if (this.tempSelectedItem === index && media[index]?.props?.className == 'type-media videosThumb') {
            media[index] = result.value;
            this.setState(prevState => ({
              previewLoadedVideosIndex: [...prevState.previewLoadedVideosIndex, index]
            }));
          }
          else if(this.tempSelectedItem === index && media[index]?.props?.className == 'type-image'){
            media[index] = result.value;
            this.setState(prevState => ({
              previewLoadedImagesIndex: [...prevState.previewLoadedImagesIndex, index]
            }));
          }
          else if(this.tempSelectedItem === index && media[index]?.props?.className == 'type-media audio'){
            media[index] = result.value;
            this.setState(prevState => ({
              previewLoadedAudioIndex: [...prevState.previewLoadedAudioIndex, index]
            }));
          }
        }
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
      }).then(() => {
        this.setState({ previewLoading: false })
      })
  };

  handleGetMedia = async (messageId = "") => {
    const { jid: msgFrom, chatType } = this.props;
    if (chatType === "broadcast") {
      let jid = formatUserIdToJid(msgFrom);
      SDK.getBroadcastChatMedia(jid, messageId);
    } else {
      let jid = formatUserIdToJid(msgFrom, chatType);
      const mediaMsgRes = await SDK.getMediaMessages({toJid : jid, lastMsgId : messageId});
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
    const removeLastIndexValue = dataMsgIdValue;
    this.setState({ selectedMediaIndex: index, initialRender: true })

    if (removeLastIndexValue) {
      const checkInitalStar = this.state.mediaList.some((ele) => ele.msgId === removeLastIndexValue && ele.favouriteStatus);
      this.setState({ starStatusCheck: checkInitalStar, seletedMsgId: removeLastIndexValue });
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
        if (this.state.lastTranslateX != newM41 && newM41) {
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
    this.commonForDidMountAndFailedDidMount();
    setTimeout(() =>{
    this.setState({ initialRender:true }, () => {
        this.diplayMedia();
      });
    },500)
  }

  commonForDidMountAndFailedDidMount(isFailed = false) {
    this.initializeMutation();
    const chatMediaList = getActiveChatMessages();
    let mediaList = chatMediaList.filter(
      (el) => el && el.msgBody && PREVIEW_MEDIA_TYPES.includes(el.msgBody.message_type) && el.deleteStatus === 0
    );
    const { featureStateData: { isViewAllMediasEnabled = false } = {} } = this.props;
    this.setState({ viewAllMedias: isViewAllMediasEnabled });
    if (mediaList.length) {
      mediaList.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
      let selectedItem = mediaList.findIndex((el) => el.msgId === this.props.selectedMessageData.msgId);
      this.setState({ selectedMediaIndex: selectedItem })
      this.tempSelectedItem = selectedItem;
      this.setState({ mediaList, selectedItem }, () => {
        this.diplayMedia();
        // Load More Data if the Inital Fetched Media Count is Less than the Config Value
        selectedItem <= INITIAL_LOAD_MEDIA_LIMIT && this.loadMoreMedia();
      });
    } else {
      this.handleGetMedia();
    }
  }

  initialCall = () => {
    const { mediaList = [], allowInitialCall = false, selectedItem = 0 } = this.state;
    if (mediaList.length > 0 && !allowInitialCall) {
      const checkInitalStar = mediaList[selectedItem].favouriteStatus === 1 ? true : false;
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

    }
    if (prevProps.groupsData && prevProps.groupsData.id !== this.props.groupsData.id) {
      const groupId = this.props.jid.split("@")[0]
      let currentGroupData = this.props.groupsData?.data.find((item) => item?.groupId === groupId)
      if (currentGroupData?.isAdminBlocked) {
        return this.props.handleMediaClose()
      }
    }

    if (this.state.initialRender && (prevState.selectedMediaIndex !== this.state.selectedMediaIndex)){
      this.diplayMedia();
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
      let indexCounter = index;
      const url = item.props?.children[0]?.props?.src;
      const duration = item.props?.children[1]?.props?.duration;
      const videoIcon = (item.props?.className === "type-media videosThumb" || item.props?.className === "type-media videos") ? "video-icon" : "";
      const FileIcon = item.props?.className === "type-image file" ? "File" : "";
      if (this.state.viewAllMedias) {
        return (
          <div key={indexCounter} className={`thumb-img ${videoIcon || FileIcon} img-load`}>
            <img
              src={url}
              key={`${indexCounter}-Img`}
              alt=""
              onLoad={this.imageOnLoad}
              className="image-load"
              style={{ display: "none" }}
            />
            <Spinner />

            {duration && (
              <p className="audio-duration" key={`${indexCounter}-Duration`}>
                {duration}
              </p>
            )}
          </div>
        );
      }
    });

  handlePrev = (onClickHandler, hasPrev) => {
    return (
      this.state.viewAllMedias && hasPrev && (
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
      this.state.viewAllMedias && hasNext && (
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

  downloadFile = () => {
    if (this.tempSelectedItem > -1 && this.state.mediaList.length > 0) {
      const selectedMediaData = this.state.mediaList[this.tempSelectedItem];
      if (selectedMediaData && Object.keys(selectedMediaData).length > 0) {
        const { msgBody: { media: { file_url, fileName: file_name, file_key, msgId } = {}, message_type = "" } = {} } =
          selectedMediaData;
        const fileName = message_type === "file" ? file_name : "";
        const messageId = (msgId && msgId !== null && msgId !== "") ? msgId : selectedMediaData?.msgId;
        downloadMediaFile(messageId, file_url, message_type, fileName, file_key);
      }
    }
  };

  handleStarMessage = async () => {
    const { starStatusCheck = false, seletedMsgId = "" } = this.state;
    SDK.updateFavouriteStatus(formatUserIdToJid(this.props.jid, this.props.chatType), [seletedMsgId], !starStatusCheck);
    this.setState({ starStatusCheck: !starStatusCheck })
  };

  render() {
    const { previewData, selectedItem, starStatusCheck = false, previewLoading } = this.state;
    const { featureStateData: { isStarMessageEnabled = false } = {} } = this.props;
    const initialThumbnailImage = getThumbBase64URL(this.state.mediaList[selectedItem]?.msgBody?.media?.thumb_image);

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Fragment>
          <div>
            <div
              className="imagePreviewContainer imagePreviewWrapper"
              id="imagePreviewContainer"
              ref="imagePreviewContainer"
            >
              {previewLoading && (
                <div className="previewContainer">
                  <img src={initialThumbnailImage} alt={initialThumbnailImage} className="previewContainerImg" />
                  <div style={{zIndex:3}}><Spinner /></div>
                </div>
              )}
              <div className="preview-options">
                <ul>
                  <li>
                    <i className="" title="Download" onClick={this.downloadFile}>
                      <PreviewDownload />
                    </i>
                  </li>

                  {isStarMessageEnabled &&
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
                  }

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
              {!!previewData.length && (
                <Carousel
                  key={this.state.mediaList[0].msgId}
                  renderArrowPrev={this.handleNext} // For Handling Right to Left Slide, We are Revering the Logic
                  renderArrowNext={this.handlePrev}
                  selectedItem={selectedItem}
                  onChange={this.handleMediaOnChange}
                  //onClickThumb={this.handleMediaOnChange}
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
    featureStateData: state.featureStateData,
    messageData: state.messageData,
    starredMessages: state.starredMessages,
    groupsData: state.groupsData
  };
};

export default connect(mapStateToProps, null)(WebChatMediaPreview);

