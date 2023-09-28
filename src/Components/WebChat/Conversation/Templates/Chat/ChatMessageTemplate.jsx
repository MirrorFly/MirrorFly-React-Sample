import React, { Fragment, useEffect, useMemo, useState } from "react";
import { isArray as _isArray, isEmpty as _isEmpty } from "lodash";
import { Menu, Translate } from "../../../../../assets/images";
import {
  downloadMediaFile,
  getDisplayNameFromGroup,
  getMessageFromHistoryById,
  getMsgStatusEle,
  isSingleChat,
  isTextMessage,
  offlineReplyHandle,
  uploadFileToSDK
} from "../../../../../Helpers/Chat/ChatHelper";
import {
  getDbInstanceName,
  getMediaClassName,
  getThumbBase64URL,
  blockOfflineAction,
  isAppOnline,
  isCallLink
} from "../../../../../Helpers/Utility";
import DropDownAction from "../Common/DropDownAction";
import ForwardMessage from "../Common/ForwardMessage";
import ReplyMessageBlock from "../Common/ReplyMessage";
import IndexedDb from "../../../../../Helpers/IndexedDb";
import { getMessageTimeElement } from "../../../../../Helpers/UIElements";
import { SingleChatSelectedMediaAction } from "../../../../../Actions/SingleChatMessageActions";
import Store from "../../../../../Store";
import { formatUserIdToJid } from "../../../../../Helpers/Chat/User";
import CommonChatStatus from "./CommonChatStatus";
import ForwardCommon from "./ForwardCommon";
import { messageForwardAdd } from "../../../../../Actions/MessageActions";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../../../Common/Modal";
import { ContactPopup } from "../../../PopUp/ContactPopup";

import TextComponent from "./TextComponent";
import ImageComponent from "./ImageComponent";
import VideoComponent from "./VideoComponent";
import AudioComponent from "./AudioComponent";
import DocumentComponent from "./DocumentComponent";
import LocationComponent from "./LocationComponent";
import ContactComponent from "./ContactComponent";
import { getExtension } from "../../../Common/FileUploadValidation";

const ChatMessageTemplate = (props = {}) => {
  const dispatch = useDispatch();
  const globalState = useSelector((state) => state.webLocalStorageSetting);
  const downloadReduxState = useSelector((state) => state.mediaDownloadData);

  const { isTranslationEnabled = false } = useSelector((state) => state.featureStateData);
  let isEnableTranslate = false;
  if (isTranslationEnabled) {
    isEnableTranslate = globalState.isEnableTranslate || false;
  }
  const {
    jid,
    messageAction,
    messageObject = {},
    vCardData = {},
    messageContent = {},
    viewOriginalMessage,
    messageInfoOptions,
    requestReplyMessage,
    addionalnfo = {},
    chatType,
    groupMemberDetails,
    message_type,
    closeMessageOption,
    pageType,
    handleTranslateLanguage
  } = props;

  const localDb = useMemo(() => new IndexedDb(), []);
  const singleChat = isSingleChat(chatType);
  const {
    fromUserId,
    createdAt,
    msgStatus,
    msgId,
    deleteStatus,
    publisherId,
    timestamp,
    favouriteStatus,
    previousMessageUser,
    msgBody: { contact = {} } = {}
  } = messageObject;
  const { name = "", phone_number = "" } = contact || {};

  const messageText = messageObject?.msgBody?.message;
  let messageFrom = singleChat ? fromUserId : publisherId;
  const { forward = false, forwardMessageId } = addionalnfo;
  const { fromUser } = vCardData;
  const isSender = messageFrom && messageFrom.indexOf(fromUser) === -1;
  // For GroupChat
  const isSameUser = messageFrom !== previousMessageUser;
  const { nameToDisplay = "", userColor = "" } = singleChat
    ? {}
    : getDisplayNameFromGroup(messageFrom, groupMemberDetails);
  const style = { color: userColor };
  const { replyTo, media = {} } = messageContent;
  const { file, caption, thumb_image, file_url, is_uploading, webWidth, fileName, file_key } = media || {};

  const [isChecked, selectedToForward] = useState(false);
  const [dropDownStatus, setDropDown] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(4);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const thumbURL = thumb_image ? getThumbBase64URL(thumb_image) : "";
  const [imgSrc, saveImage] = useState(thumbURL);
  const [popUpStatus, setPopUpStatus] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [popupStatus, setPopupStatus] = useState(false);
  const [dropRight, setDropRight] = useState(false);
  const [callLinkMessageBody, setCallLinkMessageBody] = useState({
    prevMeetText:null,
    meetLink:null,
    endMeetText:null
  })

  const isTranslatable = () => {
    const { msgBody: { translatedMessage = "", message = "", media: mediMsg = {} } = {} } = messageObject;
    const { caption: captionText = "" } = mediMsg || {};
    return !translatedMessage && (message || captionText);
  };

  const imgFileDownload = () => {
    localDb
      .getImageByKey(file_url, getDbInstanceName("image"), file_key, msgId)
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        if (isSubscribed) {
          setUploadStatus(2);
          saveImage(blobUrl);
        }
      })
      .catch(() => {
        if (isSender) {
          //is sender side only status upload 6
          setUploadStatus(6);
        }
        if (isSubscribed) saveImage(getThumbBase64URL(thumb_image));
      });
  };

  useEffect(() =>{
    const urlRegex = /https?:\/\/\S+/g;
    const ArrayOfLinkSplit = messageText && messageText.split(urlRegex) || [];
    const meetLinkUrl = messageText && messageText.match(urlRegex) || [];
    setCallLinkMessageBody({
      prevMeetText:ArrayOfLinkSplit[0],
      meetLink:meetLinkUrl[0],
      endMeetText:ArrayOfLinkSplit[1]
    })
  },[])

  useEffect(() => {
    if (replyTo) {
      const newObj = getMessageFromHistoryById(jid, replyTo);
      if (_isEmpty(newObj)) {
        requestReplyMessage(msgId, replyTo, chatType);
      } else {
        offlineReplyHandle(newObj, replyTo);
      }
    }

    // Optimize
    if (is_uploading === 0 || is_uploading === 1) {
      setUploadStatus(is_uploading);
      if (isImageMessage()) saveImage(file_url);
      if (isAudioMessage()) setMediaUrl(file_url);
    } else if (is_uploading === 3 || is_uploading === 7) {
      if (isImageMessage()) saveImage(file_url);
    } else if (is_uploading !== 0 && is_uploading !== 8) {
      if (isImageMessage()) imgFileDownload();
      else if (isAudioMessage()) getAudioFile();
      else setUploadStatus(2);
    }
    return () => setIsSubscribed(false);
  }, []);

  const messageStatus = getMsgStatusEle(msgStatus, messageFrom);

  const handleDropDown = (event) => {
    event.stopPropagation();
    setDropDown(!dropDownStatus);
    setDropRight(isTextMessage(message_type) && messageText.length <= 13 ? true : false);
  };

  const closeDropDown = () => {
    setDropDown(false);
  };

  const sentMessageToParent = (event) => {
    setDropDown(!dropDownStatus);
    messageAction(event, messageObject);
  };

  const selectMessage = (checked) => {
    selectedToForward(checked);
  };

  const imgFileDownloadOnclick = (event = {}) => {
    const {
      target: { id = "" }
    } = event;
    setUploadStatus(4);
    localDb
      .getImageByKey(id, getDbInstanceName("image"), file_key)
      .then((blobFile) => {
        const blobUrl = window.URL.createObjectURL(blobFile);
        if (isSubscribed) {
          setUploadStatus(2);
          saveImage(blobUrl);
        }
      })
      .catch(() => {
        setTimeout(() => {
          setUploadStatus(3);
        }, 4000);
        setUploadStatus(4);
        if (isSubscribed) saveImage(getThumbBase64URL(thumb_image));
      });
  };

  const handleMediaShow = (e) => {
    if (uploadStatus !== 2) {
      return true;
    }
    
    if (document && document.getElementById("imagePreviewContainer")) {
      document.getElementById("imagePreviewContainer").querySelectorAll("video, audio").forEach((element) => element.pause());
    }
    const data = { jid: props.jid, chatType: props.chatType, selectedMessageData: messageObject };
    Store.dispatch(SingleChatSelectedMediaAction(data));
    return false;
  };

  useEffect(() => {
    msgStatus === 0 && setUploadStatus(2);
  }, [msgStatus]);

  const handleDropDownVideo = (event) => {
    event.stopPropagation();
    setDropDown(!dropDownStatus);
  };

  const showForwardPopUp = () => {
    if (!isAppOnline()) {
      blockOfflineAction();
      return;
    }
    dispatch(messageForwardAdd({ msgId, timestamp, favouriteStatus }));
    setPopUpStatus(true);
  };

  const closeForwardPopUp = () => {
    closeMessageOption(true);
    setPopUpStatus(false);
  };

  const updatePhone = _isArray(phone_number) ? phone_number.join("\n") : phone_number;

  const getAudioFile = () => {
    const fileExtension = getExtension(fileName);
    const fileExtensionSlice = fileExtension.split(".")[1]
    localDb
      .getImageByKey(file_url, getDbInstanceName("audio"), file_key, msgId)
      .then((blob) => {
        const dbBlob = new Blob([blob],{type: message_type +"/"+ fileExtensionSlice});
        const blobUrl = window.URL.createObjectURL(dbBlob) 
        setMediaUrl(blobUrl);
        setUploadStatus(2);
      })
      .catch(() => {
        setMediaUrl(null);
        if (isSender) {
          //is sender side only status upload 6
          setUploadStatus(6);
        }
      });
  };

  useEffect(() => {
    if (mediaUrl === "" && file_url !== "" && is_uploading === 8) getAudioFile();
  }, [file_url]);

  useEffect(() => {
    if (pageType === "msgInfo") {
      if (isImageMessage()) {
        imgFileDownload();
      } else if (isAudioMessage()) {
        getAudioFile();
      } else if (isVideoMessage()) {
        saveImage(thumbURL);
      }
    }
  }, [msgId]);

  

  useEffect(() => {
    is_uploading === 8 && setUploadStatus(is_uploading);
    if (is_uploading === 1) {
      setUploadStatus(1);
      uploadFileToSDK(file, formatUserIdToJid(jid, chatType), msgId, props.messageContent.media);
    }
    (is_uploading === 3 || is_uploading === 7) && setUploadStatus(3);
  }, [is_uploading]);

  const audioFileDownloadOnclick = (event = {}) => {
    setUploadStatus(4);
    const {
      target: { id = "" }
    } = event;
    if (is_uploading === 1) {
      setUploadStatus(1);
      setMediaUrl(id);
    } else {
      localDb
        .getImageByKey(id, getDbInstanceName("audio"), file_key)
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          setMediaUrl(blobUrl);
          setUploadStatus(2);
        })
        .catch((err) => {
          setMediaUrl(null);
          setTimeout(() => {
            if (isSender) {
              //is sender side only status upload 6
              setUploadStatus(6);
            }
          }, 4000);
          setUploadStatus(4);
        });
    }
  };

  const downloadAction = async (event) => {
    if (uploadStatus !== 2) return;
    downloadMediaFile(msgId, file_url, "file", fileName, file_key, event);
  };

  const toggleContactPopup = () => {
    setPopupStatus(!popupStatus);
  };

  const isImageMessage = () => message_type === "image";
  const isVideoMessage = () => message_type === "video";
  const isAudioMessage = () => message_type === "audio";
  const isLocationMessage = () => message_type === "location";
  const isDocumentMessage = () => message_type === "file";
  const isContactMessage = () => message_type === "contact";

  const replyTextClass = singleChat && isTextMessage(message_type) ? " reply-text" : " sender-text-group";

  const getMessageElementRootClass = () =>
    `${isSender ? " sender" : " receiver"}${isImageMessage() && caption === "" ? " singleFile" : ""}${
      isImageMessage() || isVideoMessage() ? " image-block" : ""
    }${replyTo ? " reply-block" : ""}${isTextMessage(message_type) ? replyTextClass : ""}${
      isAudioMessage() ? " audio-message" : ""
    }${uploadStatus === 2 ? "" : " fileProgress"}${
      isLocationMessage() ? " location-message image-block singleFile" : ""
    }${isDocumentMessage() ? " file-message" : ""}${isContactMessage() ? " contact-message" : ""}`;

  return (
    <Fragment>
      <div
        id={msgId}
        className={`${getMediaClassName(dropDownStatus, isSender, forward, msgStatus, isChecked)}${
          isVideoMessage() && caption === "" ? "singleFile" : ""
        }${isVideoMessage() && caption !== "" ? " has-caption " : ""}${
          isImageMessage() && caption !== "" ? " has-caption " : ""
        }${isAudioMessage() && isSingleChat(chatType) ? " singleChat" : " groupChat"}${
          dropRight ? " drop-right" : " "
        }`}
        data-msg-type={message_type}
      >
        <ForwardMessage
          msgid={msgId}
          forwardMessageId={forwardMessageId}
          forward={forward}
          timestamp={timestamp}
          favouriteStatus={favouriteStatus}
          selectedToForward={selectMessage}
        />

        <div
          style={{ width: isImageMessage() || isVideoMessage() ? webWidth : "" }}
          className={`${getMessageElementRootClass()}${(messageObject?.msgId === downloadReduxState?.downloadingStatus[messageObject?.msgId]?.downloadMediaMsgId 
            && downloadReduxState?.downloadingStatus[messageObject?.msgId].downloading === true
            && (downloadReduxState?.downloadingStatus[msgId]?.downloadingMediaType === 'video' || downloadReduxState?.downloadingStatus[msgId]?.downloadingMediaType === 'image')) ? " fileProgress" : ""}${
            isTextMessage(message_type) && callLinkMessageBody.meetLink && isCallLink(callLinkMessageBody.meetLink) ? "meetinglink" : ""
          }`}
        >
          {isSameUser && isSender && nameToDisplay && (
            <span className="sender-name" style={style}>
              {nameToDisplay}
            </span>
          )}

          {replyTo && (
            <ReplyMessageBlock
              viewOriginalMessage={viewOriginalMessage}
              msgId={replyTo}
              chatType={chatType}
              groupMemberDetails={groupMemberDetails}
            />
          )}

          {isTextMessage(message_type) && (
            <TextComponent
              messageObject={messageObject}
              pageType={pageType}
              handleShowCallScreen={props.handleShowCallScreen}
            />
          )}

          {isImageMessage() && (
            <ImageComponent
              messageObject={messageObject}
              imgSrc={imgSrc}
              fileKey={file_key}
              handleMediaShow={handleMediaShow}
              isSender={isSender}
              uploadStatus={uploadStatus}
              imgFileDownloadOnclick={imgFileDownloadOnclick}
              pageType={pageType}
            />
          )}

          {isVideoMessage() && (
            <VideoComponent
              messageObject={messageObject}
              fileKey={file_key}
              handleMediaShow={handleMediaShow}
              thumbURL={thumbURL}
              isSender={isSender}
              uploadStatus={uploadStatus}
              imgFileDownloadOnclick={imgFileDownloadOnclick}
              pageType={pageType}
            />
          )}

          {isAudioMessage() && (
            <AudioComponent
              mediaUrl={mediaUrl}
              fileKey={file_key}
              messageObject={messageObject}
              isSender={isSender}
              uploadStatus={uploadStatus}
              audioFileDownloadOnclick={audioFileDownloadOnclick}
            />
          )}

          {isLocationMessage() && <LocationComponent messageObject={messageObject} />}

          {isDocumentMessage() && (
            <DocumentComponent
              messageObject={messageObject}
              fileKey={file_key}
              isSender={isSender}
              uploadStatus={uploadStatus}
              downloadAction={downloadAction}
            />
          )}

          {isContactMessage() && (
            <ContactComponent
              messageObject={messageObject}
              isSender={isSender}
              uploadStatus={uploadStatus}
              toggleContactPopup={toggleContactPopup}
            />
          )}

          {getMessageTimeElement(messageStatus, createdAt, favouriteStatus, isSender, message_type,fromUserId===fromUser)}

          {!isTextMessage(message_type) && (
            <Fragment>
              <CommonChatStatus
                msgId={msgId}
                chatType={chatType}
                forward={forward}
                isSender={isSender}
                favouriteStatus={favouriteStatus}
                uploadStatus={uploadStatus}
                dropDownStatus={dropDownStatus}
                handleDropDown={handleDropDownVideo}
                isSingleChat={isSingleChat(chatType)}
                messageInfoOptions={messageInfoOptions}
                msgType={message_type}
                sentMessageToParent={sentMessageToParent}
                pageType={pageType}
                messageObject={messageObject}
                handleTranslateLanguage={handleTranslateLanguage}
                isEnableTranslate={isEnableTranslate}
                caption={caption}
                isTranslatable={isTranslatable()}
              />
              <ForwardCommon
                jid={jid}
                pageType={pageType}
                forward={forward}
                popUpStatus={popUpStatus}
                uploadStatus={uploadStatus}
                showForwardPopUp={showForwardPopUp}
                closeForwardPopUp={closeForwardPopUp}
              />
            </Fragment>
          )}

          {!forward && isTextMessage(message_type) && pageType === "conversation" && (
            <div className={`${isTranslatable() && isEnableTranslate ? "drop-lg" : ""} message-dropdown-menu`}>
              <span className="message-dropdown">
                {isEnableTranslate && isTranslatable() && isSender && (
                  <span onClick={() => handleTranslateLanguage(msgId, messageObject)} className="translateIcon">
                    {" "}
                    <Translate />
                  </span>
                )}
                <span className="actionDrop" onClick={handleDropDown}></span>
                <i>
                  <Menu />
                </i>
              </span>
              {dropDownStatus && deleteStatus === 0 && (
                <DropDownAction
                  messageObject={messageObject}
                  chatType={chatType}
                  messageInfoOptions={messageInfoOptions}
                  msgid={msgId}
                  closeDropDown={closeDropDown}
                  handleDropDown={handleDropDown}
                  isSender={isSender}
                  messageAction={sentMessageToParent}
                  msgType={message_type}
                  favouriteStatus={favouriteStatus}
                />
              )}
            </div>
          )}
        </div>

        {popupStatus && (
          <Modal containerId="container">
            <ContactPopup toggleContactPopup={toggleContactPopup} name={name} phoneNumber={updatePhone} />
          </Modal>
        )}
      </div>
    </Fragment>
  );
};

export default ChatMessageTemplate;
