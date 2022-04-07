import React from "react";
import { MailIcon } from "../../../assets/images";
import ImageComponent from "./ImageComponent";
import { isUserWhoBlockedMe } from "../../../Helpers/Chat/BlockContact";

const ProfileImage = ({
  emailContactInfo = false,
  UserShortName = "",
  chatType,
  userToken,
  imageToken,
  temporary,
  emailId,
  onclickHandler = null,
  profileImageView = null,
  userId,
  name,
  ...props
}) => {
  const isUserBlockedMe = isUserWhoBlockedMe(userId);
  return (
    <div className={`profile-image ${emailContactInfo ? "email-info" : ""}`} onClick = {onclickHandler ? onclickHandler : null}>
      <div className="image">
          <ImageComponent
            chatType={chatType}
            blocked={isUserBlockedMe}
            temporary={temporary}
            userToken={userToken}
            imageToken={imageToken}
            onclickHandler={profileImageView}
            name={name}
          />
      </div>
      {emailId && (
        <i className="email-icon">
          <MailIcon />
        </i>
      )}
    </div>
  );
};

export default ProfileImage;
