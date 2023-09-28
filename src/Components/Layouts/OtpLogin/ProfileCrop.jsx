import Cropme from "croppie";
import "croppie/croppie.css";
import Store from "../../../Store";
import React, { Fragment } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import {
  CameraIcon,
  ClosePopup,
  EditCamera,
  loaderGIF,
  Remove,
  Reset,
  SampleGroupProfile,
  Takephoto,
  Tick,
  Upload,
  Viewphoto
} from "../../../assets/images";
import "../../../assets/scss/minEmoji.scss";
import { blockOfflineAction, dataURLtoFile } from "../../../Helpers/Utility";
import {
  CAMERA_ERROR,
  CAMERA_NOT_FOUND,
  CAMERA_PERMISSION_DENIED,
  CROP_PHOTO,
  PERMISSION_DENIED,
  PROFILE,
  REMOVE_PHOTO,
  TAKE_PHOTO,
  UPLOAD_PHOTO,
  VIEW_PHOTO
} from "../../processENV";
import { WebChatCropOption } from "../../WebChat/CroppieImage/WebChatCropOption";
import WebChatCroppie from "../../WebChat/CroppieImage/WebChatCroppie";
import WebChatCamera from "../../WebChat/WebChatVCard/WebChatCamera";
import ImageComponent from "../../WebChat/Common/ImageComponent";
import ProfileRemoveAlertPopUp from "../../WebChat/WebChatVCard/ProfileRemoveAlertPopUp";
import { modalActiveClassAction } from "../../../Actions/RecentChatActions";

let cropme;
class ProfileCrop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profileImg: "",
      onCameraError: false,
      showProfileImg: false,
      profileCamera: false,
      showImgDropDown: false,
      showProfileCamera: false,
      onCameraPermissionDenied: false,
      photoTaken: false,
      camImage: "",
      cameraPopup: false,
      filename: "image",
      loaderIcon: false
    };
  }

  componentDidUpdate(prevPros) {
    if (prevPros.profileImg !== this.props.profileImg) {
      this.setState({ profileImg: this.props.profileImg });
    }
  }

  handleCropImageProfileUpdate() {
    this.setState({ loaderIcon: true }, () => this.cropImageProfileImg());
  }

  cropImageProfileImg = () => {
    cropme
      .result({
        type: "base64",
        size: "original"
      })
      .then((base64Url) => {
        this.props.profileImageValidate(dataURLtoFile(base64Url, this.state.filename || ""));
        this.handleProfileCameraPopupClose();
      });
  };

  updateProfileImg = (Imgfile = {}) => {
    if (cropme) cropme.destroy();

    if (Imgfile) {
      const { name = "" } = Imgfile;
      this.setState(
        {
          filename: name,
          camImage: Imgfile,
          cameraPopup: true
        },
        () => {
          const elementContainer = document.getElementById("CameraContainer");
          cropme = new Cropme(elementContainer, WebChatCropOption);
          let readerFile = new FileReader();
          readerFile.onload = function (e) {
            cropme
              .bind({
                url: e.target.result
              })
              .then(() => {
                Object.assign(document.querySelector(".cr-viewport").style, {
                  width: "200px",
                  height: "200px"
                });
                cropme.setZoom(0);
              });
          };
          readerFile.readAsDataURL(Imgfile);
        }
      );
    }
  };

  removeProfileImage = async (e) => {
    if (blockOfflineAction()) return;

    this.props.removeProfileImage();
    this.setState({
      profileImg: "",
      showImgDropDown: false,
      showProfilePhotoRemove: false
    });
  };

  setWebcamImage = (webcamImg = {}) => {
    if (webcamImg.size > 0) {
      let fileReaderData = new FileReader();
      fileReaderData.readAsDataURL(webcamImg);
      fileReaderData.onload = () => {
        let fileProfileImage = fileReaderData.result;
        this.setState(
          {
            photoTaken: true,
            camImageDisplay: fileProfileImage,
            camImage: webcamImg
          },
          () => this.updateProfileImg(webcamImg)
        );
      };
    } else this.setState({ showProfileCamera: true });
  };

  onCameraCheck = (errorProfile = {}) => {
    const { name = "" } = errorProfile;
    if (name === "NotAllowedError") {
      this.setState({ onCameraPermissionDenied: true });
    } else if (name === "NotFoundError") {
      this.setState({ onCameraError: true });
    }
  };

  handleProfileImgDropDown = (e) => {
    if (!this.state.showImgDropDown) {
      this.setState({ showImgDropDown: true });
      Store.dispatch(modalActiveClassAction(true));
    } else {
      this.setState({ showImgDropDown: false });
      Store.dispatch(modalActiveClassAction(false));
    }
  };

  handleProfileImageShow = () => {
    this.setState({ showProfileImg: true, showImgDropDown: false });
    Store.dispatch(modalActiveClassAction(true));
  };

  handleProfileImgClose = () => {
    this.setState({ showProfileImg: false });
    Store.dispatch(modalActiveClassAction(false));
  };

  handleProfileCameraShow = (e, processType) => {
    if (processType !== "reset" && blockOfflineAction()) return;
    this.setState({ showProfileCamera: true, showImgDropDown: false, photoTaken: false });
  };

  handleProfilePhotoRemoveShow = (e) => {
    if (blockOfflineAction()) return;
    this.setState({ showProfilePhotoRemove: true, showImgDropDown: false });
  };

  handleProfileRemovephotoClose = (e) => {
    this.setState({ showProfilePhotoRemove: false });
  };

  handleProfileCameraClose = (e) => {
    this.handleProfileCameraPopupClose();
  };

  handleProfileCameraPopupClose = () => {
    this.setState({
      showProfileCamera: false,
      photoTaken: true,
      onCameraError: false,
      onCameraPermissionDenied: false,
      loaderIcon: false,
      cameraPopup: false,
      showImgDropDown: false
    });
  };

  render() {
    const {
      showProfileImg,
      showProfileCamera,
      showProfilePhotoRemove,
      onCameraPermissionDenied,
      photoTaken,
      showImgDropDown,
      profileImg,
      onCameraError,
      loaderIcon,
      cameraPopup
    } = this.state;

    return (
      <Fragment>
        <div className="userprofile-popup">
          <div className="profile-image">
            <OutsideClickHandler
              onOutsideClick={() => {
                Store.dispatch(modalActiveClassAction(false));
                this.setState({ showImgDropDown: false });
              }}
            >
              <ImageComponent
                chatType={"loginProfile"}
                blocked={false}
                temporary={false}
                imageToken={profileImg}
                onclickHandler={(e) => (profileImg !== SampleGroupProfile ? this.handleProfileImageShow(e) : null)}
              />
              <i className="camera-edit" onClick={(e) => this.handleProfileImgDropDown(e)}>
                <EditCamera />
              </i>

              {showProfileImg && (
                <div className="Viewphoto-container">
                  <div className="Viewphoto-preview">
                    <img src={profileImg} alt="vcard-profile" />
                    <i className="preview-close" onClick={(e) => this.handleProfileImgClose(e)}>
                      <ClosePopup />
                    </i>
                  </div>
                </div>
              )}

              {showImgDropDown && (
                <ul className="profile-dropdown">
                  {profileImg && (
                      <li title={VIEW_PHOTO} onClick={(e) => this.handleProfileImageShow(e)}>
                        <i className="profileedit-options">
                          <Viewphoto />
                        </i>
                        <span>{VIEW_PHOTO}</span>
                      </li>
                  )}
                  <li title={TAKE_PHOTO} onClick={(e) => this.handleProfileCameraShow(e)}>
                    <i className="profileedit-options">
                      <Takephoto />
                    </i>
                    <span>{TAKE_PHOTO}</span>
                  </li>
                  {profileImg && (
                  <li title={REMOVE_PHOTO} onClick={(e) => this.handleProfilePhotoRemoveShow(e)}>
                        <i className="profileedit-options">
                          <Remove />
                        </i>
                        <span>{REMOVE_PHOTO}</span>
                      </li>
                    )}

                  <li title={UPLOAD_PHOTO}>
                    <i className="profileedit-options">
                      <Upload />
                    </i>
                    <span className="uploadphoto">
                      <span>{UPLOAD_PHOTO}</span>
                      <WebChatCroppie
                        type={PROFILE}
                        loader={loaderIcon}
                        cameraPopup={cameraPopup}
                        cropImage={this.cropImageProfileImg}
                        updateProfileImage={this.updateProfileImg}
                        closePopUp={this.handleProfileCameraPopupClose}
                      />
                    </span>
                  </li>
                </ul>
              )}

              {showProfilePhotoRemove && (
                <ProfileRemoveAlertPopUp
                  removeProfileImage={this.removeProfileImage}
                  handleProfileRemovephotoClose={this.handleProfileRemovephotoClose}
                />
              )}

              {showProfileCamera && (
                <div className="camera-container">
                  {onCameraError && (
                    <div className="camera-popup">
                      <h4>{CAMERA_NOT_FOUND}</h4>
                      <i>
                        <CameraIcon />
                      </i>
                      <p>{CAMERA_ERROR}</p>
                      <div className="popup-controls">
                        <button
                          type="button"
                          name="btn-cancel"
                          className="btn-okay"
                          onClick={this.handleProfileCameraClose}
                        >
                          {"Okay"}
                        </button>
                      </div>
                    </div>
                  )}

                  {!onCameraError && !onCameraPermissionDenied && (
                    <div className="camera-popup-visible">
                      <div className="userprofile-header">
                        <i onClick={(e) => this.handleProfileCameraClose(e)}>
                          <ClosePopup />
                        </i>
                        {photoTaken ? <h5>{CROP_PHOTO}</h5> : <h5>{TAKE_PHOTO}</h5>}
                      </div>
                      <div className="cameraview">
                        {photoTaken && <div id="CameraContainer"></div>}
                        {!photoTaken && (
                          <WebChatCamera sendFile={this.setWebcamImage} onCameraCheck={this.onCameraCheck} />
                        )}
                      </div>
                      {photoTaken && (
                        <div className="popup-controls">
                          {!this.state.loaderIcon && (
                            <i title="Re capture">
                              <Reset onClick={(e) => this.handleProfileCameraShow(e, "reset")} />
                            </i>
                          )}
                          {!this.state.loaderIcon ? (
                            <i title="Update Profile" onClick={(e) => this.handleCropImageProfileUpdate()}>
                              <Tick />
                            </i>
                          ) : (
                            <img src={loaderGIF} alt="loader" />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {onCameraPermissionDenied && (
                    <div className="camera-popup">
                      <h4>{PERMISSION_DENIED}</h4>
                      <i>
                        <CameraIcon />
                      </i>
                      <p>{CAMERA_PERMISSION_DENIED}</p>
                      <div className="popup-controls">
                        <button
                          type="button"
                          className="btn-okay"
                          name="btn-cancel"
                          onClick={(e) => this.handleProfileCameraClose(e)}
                        >
                          {"Okay"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </OutsideClickHandler>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default ProfileCrop;
