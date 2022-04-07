import React, { useEffect, useMemo, useState } from "react";
import ProgressLoader from "../../ProgressLoader";
import IndexedDb from "../../../../../Helpers/IndexedDb";
import Translate from "./Translate";
import { captionLink, getDbInstanceName, getThumbBase64URL } from "../../../../../Helpers/Utility";

const ImageComponent = (props = {}) => {
  const {
    imgSrc,
    handleMediaShow,
    isSender = true,
    uploadStatus = 0,
    messageObject = {},
    imgFileDownloadOnclick,
    imageHeightAdjust = false,
    pageType
  } = props;

  const {
    msgId = "",
    msgBody: {
      translatedMessage = "",
      message_type ="",
      media: { caption = "", file_url = "", thumb_image = "", webWidth, webHeight } = {}
    } = {}
  } = messageObject;

  const localDb = useMemo(() => new IndexedDb(), []);
  const [imageSource, setImageSource] = useState(imgSrc || getThumbBase64URL(thumb_image));
  const [dimension, setDimension] = useState({
    width: `${webWidth}px`,
    height: `${imageHeightAdjust ? "auto" : webHeight + "px"}`,
    maxHeight: webHeight + "px"
  });

  useEffect(() => {
    if (imgSrc) {
      setImageSource(imgSrc);
      setDimension({
        width: `${webWidth}px`,
        height: `${imageHeightAdjust ? "auto" : webHeight + "px"}`,
        maxHeight: webHeight + "px"
      });
    } else {
      setImageSource(getThumbBase64URL(thumb_image));
    }
  }, [imgSrc, msgId]);

  useEffect(() => {
    if (message_type === "image" && file_url) {
      localDb.getImageByKey(file_url, getDbInstanceName("image")).then((blob) => {
        setImageSource(window.URL.createObjectURL(blob));
      });
    }
  }, [file_url, message_type]);

  const isTranslated = () =>
    isSender && pageType === "conversation" && translatedMessage && Object.keys(translatedMessage).length;

  return (
    <>
      <div className="image-wrapper">
        <div className={`image-message`} onClick={(e) => handleMediaShow && handleMediaShow(e)} style={dimension}>
          <img className="webchat-conver-image" src={imageSource} alt="chat-img" />
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
            <span>{captionLink(caption)}</span>
            {isTranslated() && <Translate tMessage={translatedMessage} />}
          </span>
        )}
      </div>
    </>
  );
};

export default ImageComponent;
