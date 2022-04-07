import React, { useState } from "react";
import SDK from "../../SDK";
import { Edit, InfoIcon } from "../../../assets/images";
import CommonInputTag from "./CommonInputTag";
import ProfileCrop from "./ProfileCrop";
import { encryption } from "../../WebChat/WebChatEncryptDecrypt";
import { blockOfflineAction, validEmail } from "../../../Helpers/Utility";
import { REACT_APP_STATUS_CHAR, VIEW_PROFILE_INFO, REACT_APP_PROFILE_NAME_CHAR } from "../../processENV";

function ProfileUpdate(props = {}) {
  const {
    handleProfileDetails,
    handleChangesProfile,
    removeProfileImage,
    profileDetails = {},
    toast,
    fromPage = "",
    fullPageLoader
  } = props;

  const [errorState, setErrorState] = useState({
    username: "",
    email: "",
    status: ""
  });

  const updateProfileDetails = async () => {
    profileDetails.loginData && encryption("auth_user", profileDetails.loginData);
    const updateprofile = await SDK.setUserProfile(
      profileDetails.username,
      profileDetails.profileImage,
      profileDetails.status,
      profileDetails.mobileNo,
      profileDetails.email
    );
    handleProfileDetails(updateprofile);
  };

  const validateField = (fieldName, value, type) => {
    let msg = "";

    switch (fieldName) {
      case "email":
        if (!value || value.trim() === "") msg = "Please enter your email";
        else if (!validEmail(value)) msg = "Please enter valid email";
        break;

      case "username":
        if (!value || value.trim() === "") msg = "Please enter your username";
        else if (value.length > REACT_APP_PROFILE_NAME_CHAR)
          msg = `Maximum ${REACT_APP_PROFILE_NAME_CHAR} characters allowed`;
        else if (value.length < 3) msg = `Username is too short`;
        break;

      case "status":
        if (!value || value.trim() === "") msg = "Please enter your status";
        else if (value.length > REACT_APP_STATUS_CHAR) msg = `Maximum ${REACT_APP_STATUS_CHAR} characters allowed`;
        break;

      default:
        break;
    }

    if (type !== "") setErrorState({ ...errorState, [fieldName]: msg });
    return msg;
  };

  const handleChanges = (field = "", e = {}) => {
    let updateObj = {};
    if (field !== "profileImage") {
      validateField(field, e.target.value, "onchange");
      if (
        (field === "username" && e.target.value.length > REACT_APP_PROFILE_NAME_CHAR) ||
        (field === "status" && e.target.value.length > REACT_APP_STATUS_CHAR)
      ) {
        return;
      }
      handleChangesProfile(field, e.target.value);
    } else {
      setErrorState(updateObj);
      handleChangesProfile(field, e);
    }
  };

  const profileImageValidate = (profileImg = {}) => {
    const allowedImageTypes = ["image/png", "image/jpeg", "image.jpg"];
    if (allowedImageTypes.includes(profileImg.type)) {
      handleChanges("profileImage", profileImg);
    } else {
      toast.error("Image type only allowed to upload");
    }
  };

  const submitProfileDetails = async () => {
    if (blockOfflineAction()) return;

    const { username = "", email = "", status = "" } = profileDetails;
    const usernameError = validateField("username", username),
      emailError = validateField("email", email),
      statusError = validateField("status", status);

    if (emailError || usernameError || statusError) {
      const obj = {};
      emailError && (obj.email = emailError);
      usernameError && (obj.username = usernameError);
      statusError && (obj.status = statusError);
      setErrorState(obj);
      return;
    }

    fullPageLoader(true);
    setErrorState({
      ...errorState,
      profileName: ""
    });
    updateProfileDetails();
  };

  const handleTextPaste = (e) => {
    let paste = (e.clipboardData || window.clipboardData).getData("text");
    let fullText = profileDetails[e.target.name] + paste;
    e.preventDefault();
    let maxCharacter = "";
    e.target.name === "username" && (maxCharacter = REACT_APP_PROFILE_NAME_CHAR);
    e.target.name === "status" && (maxCharacter = REACT_APP_STATUS_CHAR);

    validateField(e.target.name, e.target.value, "onpaste");
    handleChanges(e.target.name, {
      target: {
        name: e.target.name,
        value: fullText.slice(0, maxCharacter)
      }
    });
  };

  return (
    <form id="profileForm" className="profileForm" action="">
      <div className="heading">
        <h4>Profile</h4>
      </div>
      <div className="profileImg">
        <ProfileCrop
          chatType={"loginProfile"}
          loginProfileUpdate={true}
          profileImg={profileDetails.profileImage ? window.URL.createObjectURL(profileDetails.profileImage) : ""}
          fromPage={fromPage}
          profileImageValidate={profileImageValidate}
          removeProfileImage={removeProfileImage}
        />
      </div>
      <div className="form-group form-group-profile">
        <div className={`usenameInfo  ${!profileDetails.username ? "edit" : ""}`}>
          <CommonInputTag
            placeholder="Username"
            id={"username"}
            name={"username"}
            value={profileDetails.username}
            onChange={(e) => handleChanges("username", e)}
            className="ProfileName"
            onBlur={(e) => validateField(e.target.name, e.target.value, "onblur")}
            onPaste={handleTextPaste}
          />
          <label htmlFor="username" className="usernameEdit">
            <Edit />
          </label>
        </div>

        {errorState.username && (
          <span id="profile-name-error" className="error center">
            {errorState.username}
          </span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="">Email</label>
        <CommonInputTag
          name={"email"}
          value={profileDetails.email}
          onChange={(e) => handleChanges("email", e)}
          className="Email"
          onBlur={(e) => validateField(e.target.name, e.target.value, "onblur")}
        />
        {errorState.email && (
          <span id="profile-email-error" className="error">
            {errorState.email}
          </span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="">Mobile Number</label>
        <CommonInputTag name={"mobileNo"} value={profileDetails.mobileNo} className="phone" readOnly={true} />
      </div>
      <div className="form-group">
        <label htmlFor="">Status</label>
        <CommonInputTag
          name={"status"}
          value={profileDetails.status}
          onChange={(e) => handleChanges("status", e)}
          className="Status"
          onBlur={(e) => validateField(e.target.name, e.target.value, "onblur")}
          onPaste={handleTextPaste}
        />
        {errorState.status && (
          <span id="profile-status-error" className="error">
            {errorState.status}
          </span>
        )}
      </div>
      <div className="info-text">
        <i>
          {" "}
          <InfoIcon />{" "}
        </i>
        <span className="text-info">{VIEW_PROFILE_INFO}</span>
      </div>

      <button onClick={submitProfileDetails} id="ProfileUpdate" type="button">
        Save
      </button>
    </form>
  );
}

export default ProfileUpdate;
