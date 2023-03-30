import Cropme from 'croppie';
import 'croppie/croppie.css';
import Store from "../../../Store";
import React, { Fragment } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { connect } from 'react-redux';
import toastr from "toastr";
import {
    CameraIcon, ClosePopup, EditCamera, loaderGIF, Remove, Reset, SampleGroupProfile, SampleProfile, Takephoto, Tick,
    Upload, Viewphoto
} from '../../../assets/images';
import "../../../assets/scss/minEmoji.scss";
import IndexedDb from '../../../Helpers/IndexedDb';
import { blockOfflineAction, dataURLtoFile, fileToBlob } from '../../../Helpers/Utility';
import {
    CAMERA_ERROR, CAMERA_NOT_FOUND,
    CAMERA_PERMISSION_DENIED, CROP_PHOTO,
    PERMISSION_DENIED, PROFILE,
    REMOVE_PHOTO,
    TAKE_PHOTO,
    UPLOAD_PHOTO, VIEW_PHOTO
} from '../../processENV';
import SDK from '../../SDK';
import { WebChatCropOption } from '../CroppieImage/WebChatCropOption';
import WebChatCroppie from '../CroppieImage/WebChatCroppie';
import WebChatCamera from './WebChatCamera';
import { NO_INTERNET, PROFILE_UPDATE_SUCCESS } from '../../../Helpers/Constants';
import ImageComponent from '../Common/ImageComponent';
import { formatGroupIdToJid } from '../../../Helpers/Chat/User';
import ProfileRemoveAlertPopUp from './ProfileRemoveAlertPopUp';
import { modalActiveClassAction } from '../../../Actions/RecentChatActions';
import { isGroupChat } from '../../../Helpers/Chat/ChatHelper';


const indexedDb = new IndexedDb();

var cropme;
class ContactInfoProfileUpdate extends React.Component {
    /**
     * Following the states used in ContactInfoProfileUpdate Component.
     *
     * @param {string} profileImg Profile image path maintain in this state.
     * @param {string} showImgDropDown showImgDropDown to show profile picture property.
     * @param {string} showProfileImg showProfileImg to show profile picture.
     * @param {string} profileCamera Display the camera template.
     * @param {string} photoTaken photoTaken to maintain state for capture photo from camera.
     * @param {boolean} camImage camImage to maintain state for uploaded and captured image.
     * @param {boolean} cameraLoader cameraLoader state to maintain loader icon for camera.
     * @param {boolean} onCameraError onCameraError state to display camera device not found.
     * @param {boolean} filename filename state to maintain filename for uploaded and captured image.
     */
    constructor(props) {
        super(props);
        this.state = {
            profileBlopData: "",
            profileImg: "",
            showImgDropDown: false,
            showProfileImg: false,
            profileCamera: false,
            showProfileCamera: false,
            photoTaken: false,
            camImage: "",
            cameraLoader: false,
            onCameraError: false,
            onCameraPermissionDenied: false,
            filename: "image",
            loaderIcon: false,
            cameraPopup: false,
            imageURL: SampleGroupProfile,
            imageToken: props.imageToken
        }
    }

    /**
     * componentDidMount() method is one of the lifecycle method.
     *
     * In this method to handle loader status and call the handleProfileImg().
     */
    componentDidMount() {
        this.handleProfileImg(this.state.imageURL);
    }

    componentDidUpdate(prevProps) {
        const { chatType } = this.props;
        if (isGroupChat(chatType) && this.props.imageToken !== prevProps.imageToken) {
            this.setState({ imageToken: this.props.imageToken });
        }
    }


    /**
     * handleProfileImg() method to perform fetch the image form url and encrypt the vcard data.
     *
     * @param {object} response
     */
    handleProfileImg(val) {
        if (val !== SampleProfile) {
            this.setState({ profileImg: val });
        }
        else {
            this.setState({ profileImg: SampleProfile, showProfileImg: false });
            Store.dispatch(modalActiveClassAction(false));
        }
    }

    /**
     * handleCropImageProfileUpdate() to load the loader for croppie.
     */
    handleCropImageProfileUpdate() {
        this.setState({ loaderIcon: true }, () => this.cropImageProfileImg());
    }

    /**
     * cropImageProfileImg() to crop the selected image.
     */
    cropImageProfileImg = () => {
        cropme.result({
            type: "base64",
            size: "original"
        }).then(base64 => {
            const { filename = "" } = this.state
            const imageFileProfile = dataURLtoFile(base64, filename);
            this.setState({
                loaderIcon: true
            }, () => this.handleSaveImage(imageFileProfile))
        })
    }

    /**
     * handleSaveImage() to save the selected image.
     */
    handleSaveImage = async (image) => {
        try {
            const groupImage = image;
            const response = await SDK.setGroupProfile(formatGroupIdToJid(this.props.jid), this.props.groupName, groupImage);
            if (response.statusCode !== 200) {
                let message = response.message;
                // To get the internet offline status,
                // execute the toastr in setTimeout
                setTimeout(() => {
                    if (!navigator.onLine) message = NO_INTERNET;
                    message && toastr.error(message);
                }, 150);
            }
            if (response.statusCode === 200) {
                const fileBlob = await fileToBlob(image);
                let fileToken = "";
                if(response.fileTokenThumb !== "") fileToken = response.fileTokenThumb;
                else fileToken = response.fileToken;
                indexedDb.setImage(fileToken, fileBlob, "profileimages");
                this.setState({ imageToken: fileToken });
                toastr.success(PROFILE_UPDATE_SUCCESS);
            }

            this.handleProfileCameraPopupClose();
        } catch (error) {
            toastr.error(error.message);
            this.handleProfileCameraPopupClose();
        }
    }

    /**
     * updateProfileImg() to get image file from child component.
     */
    updateProfileImg = (Imgfile = {}) => {
        if (cropme) {
            cropme.destroy();
        }
        if (Imgfile) {
            const { name = "" } = Imgfile;
            this.setState({
                filename: name,
                camImage: Imgfile,
                cameraPopup: true
            }, () => {
                const elementData = document.getElementById("CameraContainer")
                cropme = new Cropme(elementData, WebChatCropOption);
                var readerFile = new FileReader();
                readerFile.onload = function (e) {
                    cropme.bind({
                        url: e.target.result
                    }).then(() => {
                        Object.assign(document.querySelector('.cr-viewport').style, {
                            width
                                : '200px', height: '200px'
                        })
                        cropme.setZoom(0)
                    })
                };
                readerFile.readAsDataURL(Imgfile);
            })
        }
    }


    /**
     * handleVCardClose() method to maintain state for view profile popup close window state.
     */
    handleVCardClose = () => {
        this.setState({
            viewEmojiUsername: false,
            viewEmojiStatus: false,
            viewEdit: true,
            viewEditStatus: true,
            viewTick: true,
            viewTickStatus: true,
            charCount: false,
            charCountStatus: false,
            showImgDropDown: false,
            showProfilePhotoRemove: false
        });
    }

    /**
     * removeProfileImage() method to maintain state to profile picture.
     */
    removeProfileImage = async (e) => {
        if (blockOfflineAction()) return;
        let response = await SDK.setGroupProfile(formatGroupIdToJid(this.props.jid), this.props.groupName, "");
        if (response.statusCode === 200) {
            this.setState({
                imageToken: "",
                showImgDropDown: false,
                showProfilePhotoRemove: false
            });
            toastr.success('Profile picture removed successfully');
        } else {
            const { message = "" } = response;
            toastr.error(message);
        }
    }

    /**
     * setWebcamImage() method to maintain state to set a image taken from webcamera.
     */
    setWebcamImage = (webcamImageProfile = {}) => {
        if (webcamImageProfile.size > 0) {
            let fileProfileData = new FileReader();
            fileProfileData.readAsDataURL(webcamImageProfile);
            fileProfileData.onload = () => {
                let fileProfileImage = fileProfileData.result;
                this.setState({
                    photoTaken: true, camImageDisplay: fileProfileImage, camImage: webcamImageProfile
                }, () => this.updateProfileImg(webcamImageProfile))
            }
        } else {
            this.setState({ showProfileCamera: true })
        }
    }

    /**
     * onCameraCheck() method to find whether camera device is there.
     */
    onCameraCheck = (errorProfile = {}) => {
        const { name = "" } = errorProfile;
        if (name === "NotAllowedError") {
            this.setState({ onCameraPermissionDenied: true });
        } else if (name === "NotFoundError") {
            this.setState({ onCameraError: true })
        }
    }

    /**
     * handleProfileImgDropDown() method to maintain state to show dropdown in profile page.
     */
    handleProfileImgDropDown = (e) => {
        if (this.state.showImgDropDown === false) {
            this.setState({ showImgDropDown: true })
            Store.dispatch(modalActiveClassAction(true));
        }
        else {
            this.setState({ showImgDropDown: false });
            Store.dispatch(modalActiveClassAction(false));
        }
    }

    /**
     * handleProfileImageShow() method to maintain state to show profile image in big screen.
     */
    handleProfileImageShow = (e) => {
        this.setState({ showProfileImg: true, showImgDropDown: false });
        Store.dispatch(modalActiveClassAction(true));

        //to show the original Image in big screen instead of thumbImage
        const { groupImage = "" } = this.props.roster;
        indexedDb
        .getImageByKey(groupImage, "profileimages", "")
        .then((blob) => {
            const blobUrl = window.URL.createObjectURL(blob);
            this.setState({ profileImg: blobUrl });
        })
        .catch(() => {
            this.setState({ profileImg: "" });
        });
       
    }

    getImageUrl = (url) => {
        this.setState({ profileImg: url });
    }

    /**
     * handleProfileImgClose() method to maintain state to close profile image.
     */
    handleProfileImgClose = (e) => {
        this.setState({ showProfileImg: false });
        Store.dispatch(modalActiveClassAction(false));

    }

    /**
     * handleProfileCameraShow() method to open camera popup.
     */
    handleProfileCameraShow = (e, processType) => {
        if (processType !== 'reset' && blockOfflineAction()) return;
        this.setState({ showProfileCamera: true, showImgDropDown: false, photoTaken: false, cameraLoader: true });
    }

    /**
     * handleProfilePhotoRemoveShow() method to open profile photo remove prompt.
     */
    handleProfilePhotoRemoveShow = (e) => {
        if (blockOfflineAction()) return;
        this.setState({ showProfilePhotoRemove: true, showImgDropDown: false });
    }

    /**
     * handleProfileRemovephotoClose() method to close profile photo remove prompt.
     */
    handleProfileRemovephotoClose = (e) => {
        this.setState({ showProfilePhotoRemove: false });
    }

    /**
     * handleProfileCameraClose() method to close profile camera popup.
     */
    handleProfileCameraClose = (e) => {
        this.handleProfileCameraPopupClose();
    }

    /**
     * handleProfileCameraPopupClose() method to close profile camera popup.
     */
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
    }

    checkNotFound = (event) => {
        event.target.src = SampleProfile
    }
    /**
     * render() method to render the ContactInfoProfileUpdate Component into browser.
     */
    render() {
        const {
            profileImg,
            showImgDropDown,
            showProfileImg,
            showProfileCamera,
            showProfilePhotoRemove,
            photoTaken,
            onCameraError,
            loaderIcon,
            cameraPopup,
            onCameraPermissionDenied, imageToken } = this.state;
        const { chatType, blocked, temporary } = this.props;
        return <Fragment>
            <div className="userprofile-popup">
                <div className="profile-image">
                    <OutsideClickHandler
                        onOutsideClick={() => {
                            Store.dispatch(modalActiveClassAction(false));
                            this.setState({ showImgDropDown: false });
                        }}>
                        {/* user image empty no perview button */}
                        <ImageComponent
                            chatType={chatType}
                            blocked={blocked}
                            temporary={temporary}
                            imageToken={imageToken}
                            getImageUrl={this.getImageUrl}
                            onclickHandler={(e) => profileImg !== SampleGroupProfile ? this.handleProfileImageShow(e) : null}
                        />
                        <i className="camera-edit" onClick={(e) => this.handleProfileImgDropDown(e)}>
                            <EditCamera />
                        </i>
                        {showImgDropDown &&
                            <ul className="profile-dropdown">
                                {profileImg && <>
                                    {profileImg !== SampleGroupProfile &&
                                        <li
                                            title={VIEW_PHOTO}
                                            onClick={(e) => this.handleProfileImageShow(e)}
                                        >
                                            <i className="profileedit-options">
                                                <Viewphoto />
                                            </i><span>{VIEW_PHOTO}</span></li>
                                    }
                                    <li title={TAKE_PHOTO}
                                        onClick={(e) => this.handleProfileCameraShow(e)}>
                                        <i className="profileedit-options">
                                            <Takephoto />
                                        </i>
                                        <span>{TAKE_PHOTO}</span>
                                    </li>
                                    {profileImg !== SampleGroupProfile &&
                                        <li title={REMOVE_PHOTO}
                                            onClick={(e) => this.handleProfilePhotoRemoveShow(e)}>
                                            <i className="profileedit-options">
                                                <Remove />
                                            </i>
                                            <span>{REMOVE_PHOTO}</span>
                                        </li>
                                    }
                                    <li className="upload_photo" title={UPLOAD_PHOTO}>
                                        <label className="UploadLabel" htmlFor="ProfileUpload"></label>
                                        <i className="profileedit-options"><Upload /></i>
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
                                </>}
                                {!profileImg &&
                                    <>
                                        <li title={UPLOAD_PHOTO}>
                                            <i className="profileedit-options"><Upload /></i>
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
                                        <li
                                            title={TAKE_PHOTO}
                                            onClick={(e) => this.handleProfileCameraShow(e)}>
                                            <i className="profileedit-options"><Takephoto /></i>
                                            <span>{TAKE_PHOTO}</span>
                                        </li>
                                    </>
                                }
                            </ul>
                        }
                        {showProfileImg &&
                            <div className="Viewphoto-container">
                                <div className="Viewphoto-preview">
                                    <img src={profileImg} alt="vcard-profile" />
                                    <i className="preview-close"
                                        onClick={(e) => this.handleProfileImgClose(e)}>
                                        <ClosePopup />
                                    </i>
                                </div>
                            </div>
                        }
                        {showProfileCamera &&
                            <div className="camera-container">
                                {onCameraError &&
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
                                                onClick={(e) => this.handleProfileCameraClose(e)}
                                            >
                                                {"Okay"}
                                            </button>
                                        </div>
                                    </div>}

                                {onCameraPermissionDenied &&
                                    <div className="camera-popup">
                                        <h4>{PERMISSION_DENIED}</h4>
                                        <i>
                                            <CameraIcon />
                                        </i>
                                        <p>{CAMERA_PERMISSION_DENIED}</p>
                                        <div className="popup-controls">
                                            <button type="button"
                                                className="btn-okay"
                                                name="btn-cancel">{"Okay"}
                                                onClick={(e) => this.handleProfileCameraClose(e)}
                                            </button>
                                        </div>
                                    </div>}

                                {!onCameraError && !onCameraPermissionDenied &&
                                    <div className="camera-popup-visible">
                                        <div className="userprofile-header">
                                            <i
                                                onClick={(e) => this.handleProfileCameraClose(e)}>
                                                <ClosePopup /></i>
                                            {photoTaken ? <h5>{CROP_PHOTO}</h5> : <h5>{TAKE_PHOTO}</h5>}
                                        </div>
                                        <div className="cameraview">
                                            {photoTaken &&
                                                <div id='CameraContainer'></div>
                                            }
                                            {!photoTaken &&
                                                <WebChatCamera
                                                    sendFile={this.setWebcamImage}
                                                    onCameraCheck={this.onCameraCheck}
                                                />
                                            }
                                        </div>
                                        {photoTaken &&
                                            <div className="popup-controls">
                                                {!this.state.loaderIcon &&
                                                    < i title="Re capture">
                                                        <Reset
                                                            onClick={(e) => this.handleProfileCameraShow(e, 'reset')} />
                                                    </i>}
                                                {!this.state.loaderIcon ?
                                                    <i title="Update Profile"
                                                        onClick={(e) => this.handleCropImageProfileUpdate()}>
                                                        <Tick />
                                                    </i> : <img src={loaderGIF} alt="loader" />
                                                }
                                            </div>
                                        }
                                    </div>}
                            </div>
                        }
                        {showProfilePhotoRemove &&
                            <ProfileRemoveAlertPopUp
                                removeProfileImage={this.removeProfileImage}
                                handleProfileRemovephotoClose={this.handleProfileRemovephotoClose}

                            />
                        }
                    </OutsideClickHandler >
                </div>
            </div>
        </Fragment>
    }
}

const mapStateToProps = (state, props) => {
    return ({
        vCardData: state.vCardData
    });
};

export default connect(mapStateToProps, null)(ContactInfoProfileUpdate);
