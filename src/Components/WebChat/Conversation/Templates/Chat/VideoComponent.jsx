import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProgressLoader from "../../ProgressLoader";
import { Playbtn2, VideoIcon3 } from "../../../../../assets/images";
import { captionLink, getThumbBase64URL, millisToMinutesAndSeconds } from "../../../../../Helpers/Utility";
import Translate from "./Translate";

const VideoComponent = (props = {}) => {
  const globalStore = useSelector((state) => state);
  const {
    thumbURL,
    handleMediaShow,
    isSender = true,
    uploadStatus = 0,
    messageObject = {},
    imgFileDownloadOnclick,
    imageHeightAdjust = false,
    pageType
  } = props;

  const { mediaDownloadData } = globalStore || {};

  const {
    msgId = "",
    msgBody: {
      translatedMessage = "",
      media: { caption = "", file_url = "", duration, thumb_image = "", webWidth, webHeight } = {},
      mentionedUsersIds = []
    } = {}
  } = messageObject;


  const [dimension, setDimension] = useState({
    width: `${webWidth}px`,
    height: `${imageHeightAdjust ? "auto" : webHeight + "px"}`,
    maxHeight: webHeight + "px"
  });
  const [thumbImgSrc] = useState(thumbURL || getThumbBase64URL(thumb_image));

  useEffect(() => {
    if (thumbURL) {
      setDimension({
        width: `${webWidth}px`,
        height: `${imageHeightAdjust ? "auto" : webHeight + "px"}`,
        maxHeight: webHeight + "px"
      });
    }
  }, [thumbURL, msgId]);

  const isTranslated = () =>
    isSender && pageType === "conversation" && translatedMessage && Object.keys(translatedMessage).length;


  return (
    <>
      <div className="image-wrapper">
        <div className={`image-message`} onClick={(e) => handleMediaShow && handleMediaShow(e)} style={dimension}>
          <img className="webchat-conver-image" src={thumbImgSrc} alt="chat-img" />

          <div className="image-overlay">
            <span className="duration">
              <i>
                <VideoIcon3 />
              </i>
              <span className="video-duration">{millisToMinutesAndSeconds(duration)}</span>
            </span>
            {msgId === mediaDownloadData?.downloadingStatus[msgId]?.downloadMediaMsgId && mediaDownloadData?.downloadingStatus[msgId]?.downloading === true ? (
              <i></i>
            ) : (
              <i className="playbtn">
                <Playbtn2 />
              </i>
            )}
          </div>
        </div>
        <ProgressLoader
          msgId={msgId}
          isSender={isSender}
          file_url={file_url}
          uploadStatus={uploadStatus}
          imgFileDownloadOnclick={imgFileDownloadOnclick}
        />
      </div>
      <div className="image-caption">
        {caption !== "" && (
          <span>
            <span>{captionLink(caption, mentionedUsersIds)}</span>
            {isTranslated() && <Translate tMessage={translatedMessage} />}
          </span>
        )}
      </div>
    </>
  );
};

export default VideoComponent;
