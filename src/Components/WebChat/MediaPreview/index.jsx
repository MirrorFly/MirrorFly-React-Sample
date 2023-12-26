import React, { Component, Fragment, Suspense } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast } from "react-toastify";
import uuidv4 from "uuid/v4";
import { AudioFile, dragDrop } from "../../../assets/images";
import "../../../assets/scss/image-gallery-custom.scss";
import Config from "../../../config";
import { INLINE_FLEX, FEATURE_RESTRICTION_ERROR_MESSAGE } from "../../../Helpers/Constants";
import { getMessageType, getThumbBase64URL, millisToMinutesAndSeconds, blockOfflineMsgAction, generateImageThumbnail } from "../../../Helpers/Utility";
import { getExtension, sendErrorMessage, validateFile } from "../../WebChat/Common/FileUploadValidation";
import getFileFromType from "../Conversation/Templates/Common/getFileFromType";
import Spinner from "../Conversation/Templates/Common/Spinner";
import PreviewAudio from "./Audio";
import PreviewDocument from "./Document";
import Image from "./Image";
import "./media-attachment.scss";
import PreviewVideo from "./Video";
import { MediaImageThumbData } from "../../../Actions/Media";
import Store from "../../../Store";
window.URL = window.URL || window.webkitURL;
const maxAllowedMediaCount = Config.maxAllowedMediaCount;

export default class MediaPreview extends Component {
  constructor() {
    super();
    this.state = {
      mediaList: [],
      previewData: [],
      selectedFiles: [],
      isZoomed: false,
      videoProgress: 0,
      videoDuration: "",
      selectedSlide: 0,
      imageThumurls:[]
    };
    document.addEventListener("keydown", this.handleKeyboardActions, true);
  }

  componentDidMount() {
    const { seletedFiles: { filesId, mediaType } = {} } = this.props;
    if (!filesId) return;
    this.thumbImageCreation(this.props.seletedFiles.files)
    this.handleFiles(this.props.seletedFiles.files, mediaType);
  }
  
  componentDidUpdate(prevProps) {
    const {
      seletedFiles: { filesId }
    } = this.props;

    const prevFileId = prevProps?.selectedFiles?.fileId;
    if (filesId && prevFileId && filesId !== prevFileId) {
      this.handleFiles(this.props.seletedFiles.files, "");
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyboardActions, true);
  }

  handleKeyboardActions = (e) => {
    switch (e.keyCode) {
      case 13:
        this.state.selectedFiles.length > 0 && !e.shiftKey && this.sendMediaFile();
        break;
      case 27:
        this.closePreview();
        break;
      case 37:
        let getActiveClass = document.getElementById("imagePreviewContainer").querySelector(".incaption");
        !getActiveClass && this.Previous && this.Previous.click();
        break;
      case 39:
        let rigthActiveClass = document.getElementById("imagePreviewContainer").querySelector(".incaption");
        !rigthActiveClass && this.Next && this.Next.click();
        break;

      default:
        break;
    }
  };

  thumbImageCreation = async (files) => {
    if (files) {
      setTimeout(async() =>{
        for (const key in files) {
          if (Object.hasOwnProperty.call(files, key)) {
            const file = files[key];
            const fileId = await file?.fileDetails?.fileId;
            const fileName = file?.name;
            const fileExtension = fileName.split('.').pop();
            const fileType = file?.type?.split('/')[0];
            if(fileType === "image"){
              try {
                const thumbImage = await generateImageThumbnail(file, fileExtension);
                const thumbImageObj = {thumbImage, fileId}
                const thumbImageurl = getThumbBase64URL(thumbImage);
                Store.dispatch(MediaImageThumbData(thumbImageObj));
                this.setState(
                  {
                    imageThumurls: [
                      ...this.state.imageThumurls,
                      {thumbImageurl, fileId}
                    ]
                  })
              } catch (error) {
                console.error("Error generating thumbnail:", error);
              }
            }
          }
        }
      })
    }
  };
  
   

  onDragOver = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    imagePreviewContainer && imagePreviewContainer.classList.add("highlight");
    return false;
  };

  onDrop = (e) => {
    e.preventDefault();
    const { seletedFiles: { mediaType } = {} } = this.props;
    let files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    imagePreviewContainer && imagePreviewContainer.classList.remove("highlight");
    if (files) {
      this.setState(
        {
          dragedFiles: {
            dragId: uuidv4(),
            files: files
          }
        },
        () => {
          if (Array.from(files).length > 0) {
            this.handleFiles(files, mediaType);
          }
        }
      );
    }
  };

  createAddFileContainer = (thumbsWrapper,mediaType) => {
    const {attachment : { isAttachmentEnabled = false  } = {} } = this.props;
    let child = document.createElement("div");
    if(mediaType === "imagevideo") {
    child.innerHTML = `<div id="dynamicUpload" class="uploadfile" style="display: ${
      this.state.selectedFiles.length >= maxAllowedMediaCount ? "none" : INLINE_FLEX
    }">
            <div><label for="addfile"><input id="addfile" class="uploadfileinput" type="file"
            accept=".webm,.mp4,.x-m4v,.png,.jpeg,.jpg,video/x-m4v" multiple /></label>
            <i class="addIcon"></i><span>ADD FILE</span></div></div>`;
    }
    else if(mediaType === "image") {
      child.innerHTML = `<div id="dynamicUpload" class="uploadfile" style="display: ${
        this.state.selectedFiles.length >= maxAllowedMediaCount ? "none" : INLINE_FLEX
      }">
              <div><label for="addfile"><input id="addfile" class="uploadfileinput" type="file"
              accept=".png,.jpeg,.jpg" multiple /></label>
              <i class="addIcon"></i><span>ADD FILE</span></div></div>`;
    }
    else if(mediaType === "video") {
      child.innerHTML = `<div id="dynamicUpload" class="uploadfile" style="display: ${
        this.state.selectedFiles.length >= maxAllowedMediaCount ? "none" : INLINE_FLEX
      }">
              <div><label for="addfile"><input id="addfile" class="uploadfileinput" type="file"
              accept=".webm,.mp4,.x-m4v,video/x-m4v" multiple /></label>
              <i class="addIcon"></i><span>ADD FILE</span></div></div>`;
    }
    else if(mediaType === "audio") {
      child.innerHTML = `<div id="dynamicUpload" class="uploadfile" style="display: ${
        this.state.selectedFiles.length >= maxAllowedMediaCount ? "none" : INLINE_FLEX
      }">
              <div><label for="addfile"><input id="addfile" class="uploadfileinput" type="file"
              accept=".wav,.mp3,.aac" multiple /></label>
              <i class="addIcon"></i><span>ADD FILE</span></div></div>`;
    }
    else if(mediaType === "file") {
      child.innerHTML = `<div id="dynamicUpload" class="uploadfile" style="display: ${
        this.state.selectedFiles.length >= maxAllowedMediaCount ? "none" : INLINE_FLEX
      }">
              <div><label for="addfile"><input id="addfile" class="uploadfileinput" type="file"
              accept=".pdf,.xlsx,.xls,.txt,.doc, .docx, text/plain, .csv, .ppt, .zip, .rar, .pptx" multiple /></label>
              <i class="addIcon"></i><span>ADD FILE</span></div></div>`;
    }else{
      if(isAttachmentEnabled){
        child.innerHTML = `<div id="dynamicUpload" class="uploadfile" style="display: ${
          this.state.selectedFiles.length >= maxAllowedMediaCount ? "none" : INLINE_FLEX
        }">
                <div><label for="addfile"><input id="addfile" class="uploadfileinput" type="file"
                multiple /></label>
                <i class="addIcon"></i><span>ADD FILE</span></div></div>`;
      }
      else{
        toast.error(FEATURE_RESTRICTION_ERROR_MESSAGE);
        return this.closePreview();
       }
    }
  
    child = child.firstChild;
    child.querySelector(".uploadfileinput").addEventListener("change", (event) => {
      this.handleFiles(event.target.files, mediaType, "new");
    });
    thumbsWrapper.appendChild(child);
    let sendButtonChild = document.createElement("div");
    sendButtonChild.innerHTML = `<div class="attachmentSend"><i>
    <svg fill="#fff" width="26.705" height="25.802" viewBox="0 0 26.705 25.802"><path d="M0,64.052l26.7-12.9L0,38.25v11l14.525,1.905L0,53.057Z" 
    transform="translate(0 -38.25)"></path></svg></i></div>`;
    sendButtonChild = sendButtonChild.firstChild;
    sendButtonChild.querySelector("i").addEventListener("click", (event) => {
      this.sendMediaFile();
    });
    thumbsWrapper.parentElement.appendChild(sendButtonChild);
  };

  /**
   * @param {any} files - Selected Files
   * @param {any} mediaType - To Handle Corresponding Error Message for Different Medias
   * @param {any} type - To Handle Selected Slides When New Media Added
   */
  handleFiles = (files, mediaType, type) => {
    let filesArray = Array.from(files);
    const { selectedFiles } = this.state;

    validateFile(filesArray, mediaType)
      .then((res) => {
        const filterValid = filesArray.filter((file, index) => {
          return res.find((ele, responseIndex) => responseIndex === index && ele);
        });
        if (filterValid.length + this.state.selectedFiles.length > maxAllowedMediaCount) {
          sendErrorMessage();
        }
        this.setState(
          {
            showAvailableOptions: false,
            selectedFiles: [
              ...selectedFiles,
              ...filterValid.map((file) => {
                let fileId = uuidv4();
                file.fileDetails = {
                  fileId: fileId
                };
                return file;
              })
            ].slice(0, maxAllowedMediaCount)
          },
          () => {
            this.setState(
              {
                previewData: this.handleDisplayMedia(type),
                ...(type === "new" && { selectedSlide: selectedFiles.length })
              },
              () => {
                const thumbsWrapper = document.getElementById("imagePreviewContainer").querySelector(".thumbs-wrapper");
                const uploadcontainer = document.getElementById("dynamicUpload");
                if (thumbsWrapper && !uploadcontainer) {
                  this.createAddFileContainer(thumbsWrapper,mediaType);
                } else {
                  if (uploadcontainer)
                    uploadcontainer.style.display = this.state.selectedFiles.length >= maxAllowedMediaCount
                      ? "none" : INLINE_FLEX;
                }
              }
            );
          }
        );
      })
      .catch((err) => console.log(err, "upload file error"));
  };

  removeSelectedItem = (deleteThis) => {
    const { selectedFiles, selectedSlide } = this.state;
    let index = selectedFiles.indexOf(deleteThis);
    const filterItem = selectedFiles.filter((elem, i) => i !== index);
    let newActiveSlide = selectedSlide !== 0 && selectedSlide === filterItem.length ? selectedSlide - 1 : selectedSlide;

    this.setState(
      {
        selectedFiles: filterItem,
        selectedSlide: newActiveSlide
      },
      () => {
        const uploadcontainer = document.getElementById("dynamicUpload");
        if (uploadcontainer) uploadcontainer.style.display = INLINE_FLEX;
        this.setState({
          previewData: this.handleDisplayMedia()
        });
      }
    );
  };

  onChangeCaption = (updateThis = {}, caption = "", mentionedUsersIds = []) => {
    let temp = document.createElement("div");
    temp.innerHTML = caption;
    updateThis.caption = temp.innerHTML;
    updateThis.mentionedUsersIds = mentionedUsersIds
    return true;
  };

  updateMedia = (updateThis, fileMetaData) => {
    const { selectedFiles } = this.state;
    let index = selectedFiles.indexOf(updateThis);
    const updateItem = selectedFiles.map((element, i) => {
      if (i === index) {
        element.fileDetails = {
          fileId: updateThis?.fileDetails?.fileId,
          ...fileMetaData
        };
      }
      return element;
    });
    this.setState({
      selectedFiles: updateItem
    });
  };

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
          title="Next"
          ref={(input) => (this.Next = input)}
          aria-label="next slide / item"
          className="control-arrow control-next"
        ></button>
      )
    );
  };

  handleMediaOnChange = (index, item) => {
    this.setState({ selectedSlide: index });
    document
      .getElementById("imagePreviewContainer")
      .querySelectorAll("video, audio")
      .forEach((element) => element.pause());
  };

  sendMediaFile = () => {
    if(blockOfflineMsgAction()) return false;
    const found = this.state.selectedFiles.filter((el) => {
      const { fileDetails: { msgType, imageUrl }} = el;
      return !((!msgType || msgType === "image" || msgType === "video ") && !imageUrl);
    });
    if (found.length !== this.state.selectedFiles.length) return true;

    this.props.onClickSend(this.state.selectedFiles);
    return true;
  };

  handleDisplayMedia = (type) => {
    const { selectedFiles } = this.state;
    const { seletedFiles: { chatType } = {}, chatId } = this.props;
    if (selectedFiles.length === 0) return this.closePreview();
    return selectedFiles.map((res, index) => {
      let fileType = res.type;
      let mediaType = getMessageType(res.type, res);
      const fileExtension = getExtension(res.name);
      const { fileDetails: { fileId }, caption = "" } = res;
      switch (mediaType) {
        case "image":
          return (
            <Image
              thumb={"image"}
              key={fileId}
              type={type}
              uniqueId={fileId}
              selectedFiles={selectedFiles}
              onClickSend={this.sendMediaFile}
              chatType={chatType}
              chatId={chatId}
              media={res}
              caption={caption}
              onClickCloseSelectedItem={this.props.onClickCloseSelectedItem}
              onChangeCaption={this.onChangeCaption}
              updateMedia={this.updateMedia}
            />
          );
        case "video":
          return (
            <PreviewVideo
              thumb={"video"}
              key={fileId}
              type={type}
              uniqueId={fileId}
              selectedFiles={selectedFiles}
              onClickSend={this.sendMediaFile}
              chatType={chatType}
              chatId={chatId}
              media={res}
              caption={caption}
              onClickCloseSelectedItem={this.props.onClickCloseSelectedItem}
              onChangeCaption={this.onChangeCaption}
              updateMedia={this.updateMedia}
            />
          );
        case "file":
          const placeholder = getFileFromType(fileType, fileExtension);
          return (
            <PreviewDocument
              thumb={"file"}
              key={fileId}
              onClickSend={this.sendMediaFile}
              media={res}
              caption={caption}
              placeholder={placeholder}
              onClickCloseSelectedItem={this.props.onClickCloseSelectedItem}
              onChangeCaption={this.onChangeCaption}
              updateMedia={this.updateMedia}
            />
          );
        case "audio":
          return (
            <PreviewAudio
              thumb={"audio"}
              key={fileId}
              onClickSend={this.sendMediaFile}
              media={res}
              caption={caption}
              onClickCloseSelectedItem={this.props.onClickCloseSelectedItem}
              onChangeCaption={this.onChangeCaption}
              updateMedia={this.updateMedia}
            />
          );
        default:
          return <div key={fileId}></div>;
      }
    });
  };

  closePreview = () => {
    this.props.onClosePreview();
  };

  getSrcDocument = (thumb, placeholder) => {
    if (thumb === "file") {
      return placeholder;
    }
    return AudioFile;
  };

  imageOnLoad = (e) => {
    e.target.classList.remove("image-load");
    e.target.style.display = "block";
  };

  getMediaSrc = (thumb, placeholder, imageUrl, fileId = null) => {
    let mediaSrc;
    const foundItem = this.state.imageThumurls.find(item => item.fileId === fileId);
    switch (thumb) {
      case "file":
      case "audio":
        mediaSrc = this.getSrcDocument(thumb, placeholder);
        break;

      case "video":
        mediaSrc = getThumbBase64URL(imageUrl);
        break;

      case "image":
        mediaSrc = foundItem?.thumbImageurl ? foundItem?.thumbImageurl : null;
        break;

      default:
        break;
    }

    return mediaSrc;
  };

  customRenderThumb = (children) => {
    return children.map((item, index) => {
      const {
        placeholder,
        thumb,
        media: {
          fileDetails: { fileId, imageUrl = "", duration }
        }
      } = item.props;

      const mediaSrc = this.getMediaSrc(thumb, placeholder, imageUrl, fileId);

      return (
        <div key={fileId} className={thumb === "file" ? "thumb-img file img-load" : "thumb-img img-load"}>
          <span
            onClick={(e) => {
              e.stopPropagation();
              this.removeSelectedItem(item.props.media);
            }}
            title="Remove"
            className="removeSelected"
          ></span>
          <img
            src={mediaSrc}
            key={`${fileId}-Img`}
            alt=""
            onLoad={this.imageOnLoad}
            className="image-load"
            style={{ display: "none" }}
          />
           <Spinner />
          {duration && (
            <p className={`${thumb === "video" ? "video-duration" : "audio-duration"}`} key={`${fileId}-Duration`}>
              {millisToMinutesAndSeconds(duration)}
            </p>
          )}
        </div>
      );
    });
  };

  render() {
    let { previewData, selectedFiles, selectedSlide } = this.state;
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Fragment>
          <div
            onDrop={this.onDrop}
            onDragOver={this.onDragOver}
            className="imagePreviewContainer mediaAttachmemtUpload"
            id="imagePreviewContainer"
          >
            <div className="attachments-header">
              <h5>Preview</h5>
              <i onClick={this.closePreview}>
                <svg width="24px" height="24px" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  <path d="M0 0h24v24H0z" fill="none"></path>
                </svg>
              </i>
            </div>
            {selectedFiles.length > 0 ? (
              <Carousel
                renderArrowPrev={this.handlePrev}
                renderArrowNext={this.handleNext}
                selectedItem={selectedSlide}
                onChange={this.handleMediaOnChange}
                onClickThumb={this.handleMediaOnChange}
                renderThumbs={this.customRenderThumb}
                interval="100"
                transitionTime="10"
                thumbWidth="80"
                swipeable={false}
              >
                {previewData}
              </Carousel>
            ) : (
              <div className="drag-preview">
                <div className="drag-area">
                  <div>
                    <div className="drag-area-inner">
                      <span>
                        <img src={dragDrop} alt="Drag and Drop" />
                      </span>
                      <h1>Drag &amp; Drop Your Files Here</h1>
                      <p>
                        Make sure to upload a 'JPG, JPEG, PNG, MP3, MP4, PDF, XLS, XLSX, DOC, DOC, PPT, PPTX, RAR, ZIP,
                        CSV or TXT' file
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Fragment>
      </Suspense>
    );
  }
}
