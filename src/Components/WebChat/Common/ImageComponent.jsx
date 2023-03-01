import React, { useEffect, useMemo, useState } from "react";
import { broadcast, GroupChatAvatarImg, SingleChatAvatarImg, Loader,ImgUserPlaceholder } from "../../../assets/images";
import { classNames, isSingleChat } from "../../../Helpers/Chat/ChatHelper";
import IndexedDb from "../../../Helpers/IndexedDb";
import { getColorCodeInitials, getInitialsFromName } from "../../../Helpers/Utility";
import SvgProfileName from "./SvgProfileName";

const avatarIconObject = {
  chat: SingleChatAvatarImg,
  groupchat: GroupChatAvatarImg,
  broadcast: broadcast,
  loginProfile: ImgUserPlaceholder
};

const ImageComponent = React.memo(
  ({
    userToken,
    imageToken,
    fileKey = "",
    blocked = false,
    chatType,
    temporary,
    getImageUrl,
    onclickHandler,
    imageType = "profileimages",
    name = "",
    ...props
  }) => {
    const localDb = useMemo(() => new IndexedDb(), []);
    const avatarIcon = chatType ? avatarIconObject[chatType] : avatarIconObject["chat"];
    const [getImage, saveImage] = useState(null);
    const [imgPointer, setImgPointer] = useState(false);
    const [showInitials, toggleInitials] = useState(false);
    const [initialsData, setInitialsData] = useState({ colorCode: "", inital: "" });

    useEffect(() => {
      toggleInitials(false);
      let isSubscribed = true;

      if ((blocked || !imageToken) && isSubscribed) {
        if (isSingleChat(chatType) && name && !blocked) {
          const initialName = getInitialsFromName(name);
          if (initialName) {
            toggleInitials(true);
            setInitialsData({ colorCode: getColorCodeInitials(name), inital: initialName });
          }
        }
        saveImage(null);
        return () => (isSubscribed = false);
      }

      if (new RegExp("^(blob:http|blob:https)://", "i").test(imageToken)) return saveImage(imageToken);

      localDb
        .getImageByKey(imageToken, imageType, fileKey)
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          isSubscribed && saveImage(blobUrl);
        })
        .catch(() => {
          isSubscribed && saveImage(null);
          setImgPointer(true);
        });
      return () => (isSubscribed = false);
    }, [imageToken, blocked, name]);

    const onImageLoad = (event) => (event.target.style.backgroundImage = "");
    const checkNotFound = (event) => (event.target.src = avatarIcon);
    const addclass = props.classProps ? classNames(props.classProps) : null;
    const updatedUrl = getImage ? getImage : avatarIcon;

    useEffect(() => {
      if (getImageUrl) {
        getImageUrl(updatedUrl);
      }
    }, [updatedUrl]);

    if (showInitials && !blocked) {
      return <SvgProfileName userShortName={initialsData.inital} initialColor={initialsData.colorCode} />;
    }
    return (
      <img
        src={updatedUrl}
        data-jest-id={"jestImageComponent"}
        style={{ backgroundImage: `url(${Loader})`, cursor: `${updatedUrl === avatarIcon ? "default" : ""}` }}
        onLoad={onImageLoad}
        className={`${addclass} ${props.caption === "" ? "no-caption" : ""} ${imgPointer ? "cursor-default" : ""}`}
        onError={checkNotFound}
        alt={""}
        onClick={updatedUrl !== avatarIcon ? onclickHandler : null}
      />
    );
  }
);

export default ImageComponent;
