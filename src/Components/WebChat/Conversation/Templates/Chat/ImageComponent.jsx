import React, { useEffect, useMemo, useState } from "react";
import ProgressLoader from "../../ProgressLoader";
import IndexedDb from "../../../../../Helpers/IndexedDb";
import Translate from "./Translate";
import { captionLink, generateImageThumbnail, getDbInstanceName, getThumbBase64URL, isBlobUrl } from "../../../../../Helpers/Utility";
import { getLocalUserDetails } from "../../../../../Helpers/Chat/User";
import { useSelector } from "react-redux";

const ImageComponent = (props = {}) => {
  const {
    imgSrc,
    handleMediaShow,
    isSender = true,
    uploadStatus = 0,
    messageObject = {},
    imgFileDownloadOnclick,
    imageHeightAdjust = false,
    pageType,
    imageUrlDownloaded
  } = props;
  const {
    msgId = "",
    msgBody: {
      translatedMessage = "",
      message_type = "",
      media: { caption = "", file_url = "", thumb_image = "", webWidth, webHeight, file_key, file } = {},
      mentionedUsersIds = []
    } = {}
  } = messageObject;
  const localDb = useMemo(() => new IndexedDb(), []);
  const mediaImageThumbData = useSelector((state) => state.mediaImageThumbData);
  const [imageSource, setImageSource] = useState(imgSrc || getThumbBase64URL(thumb_image));
  const [imageThumbUrl, setImageThumbUrl] = useState(mediaImageThumbData[file?.fileDetails?.fileId]?.thumbImage)
  const [dimension, setDimension] = useState({
    width: `${webWidth}px`,
    height: `${imageHeightAdjust ? "auto" : webHeight + "px"}`,
    maxHeight: webHeight + "px"
  });
  const vcardData = getLocalUserDetails();

  useEffect(() => {
    if (imgSrc) {
      setImageSource(imgSrc);
      setDimension({
        width: `${webWidth}px`,
        height: `${imageHeightAdjust ? "auto" : webHeight + "px"}`,
        maxHeight: webHeight + "px"
      });
    } else if(thumb_image) {
      setImageSource(getThumbBase64URL(thumb_image));
    } else {
      generateThumbImage(file);
    }
  }, [imgSrc, msgId]);

  const generateThumbImage = async (file) => {
    const fileName = file?.name;
    const fileExtension = fileName.split('.').pop();
    try {
      const thumbImage = await generateImageThumbnail(file, fileExtension);
      setImageThumbUrl(thumbImage);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
    }
  }

  useEffect(() => {
    if (message_type === "image" && file_url && imageSource.search("blob:") == -1) {
      if (isBlobUrl(file_url)) {
        setImageSource(file_url);
      } else {
        localDb.getImageByKey(file_url, getDbInstanceName("image"), file_key, msgId).then((blob) => {
          setImageSource(window.URL.createObjectURL(blob));
        });
      }
    }
  }, [file_url, message_type]);

  useEffect(() => {
    if (imageSource.search("blob:") !== -1) {
      setImageSource((prevImgUrl) => {
        imageUrlDownloaded && imageUrlDownloaded(prevImgUrl);
        return prevImgUrl;
      });
    }
  }, [imageSource]);

  const isTranslated = () =>
    isSender && pageType === "conversation" && translatedMessage && Object.keys(translatedMessage).length;

  return (
    <>
      <div className="image-wrapper">
        <div className={`image-message`}  onClick={(e) => handleMediaShow && imageSource.search("blob:") !== -1 && handleMediaShow(e)} style={dimension}>
          <img className="webchat-conver-image" style={imageSource.search("blob:") !== -1 ? {cursor:"pointer"} : {cursor:"auto"}} src={((!isSender && uploadStatus == 1 && imageThumbUrl) || (uploadStatus == 2 && imageThumbUrl && imageSource.search("blob:") === -1))? getThumbBase64URL(imageThumbUrl) : imageSource} alt="chat-img" />
        </div>
        <ProgressLoader
          msgId={msgId}
          isSender={isSender}
          file_url={file_url}
          uploadStatus={uploadStatus}
          imgFileDownloadOnclick={imgFileDownloadOnclick}
          messageType = {"image"}
          downloadEnabled ={imageSource.search("blob:") !== -1 ? true : false}
        />
      </div>
      <div className="image-caption">
        {caption !== "" && (
          <span>
            <span>{captionLink(caption,mentionedUsersIds,vcardData.userId, messageObject.chatType)}</span>
            {!!isTranslated() && <Translate tMessage={translatedMessage} />}
          </span>
        )}
      </div>
    </>
  );
};

export default ImageComponent;
