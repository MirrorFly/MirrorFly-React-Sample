import Cropme from 'croppie';
import 'croppie/croppie.css';
import React, { Fragment } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { connect } from 'react-redux';
import renderHTML from 'react-render-html';
import toastr from "toastr";
import {
    CameraIcon, ClosePopup, EditCamera, loaderGIF, Remove, Reset, SampleProfile, Takephoto, Tick,
    Upload, Viewphoto
} from '../../../assets/images';
import "../../../assets/scss/minEmoji.scss";
import IndexedDb from '../../../Helpers/IndexedDb';
import { ls } from '../../../Helpers/LocalStorage';
import { blockOfflineAction, dataURLtoFile, fileToBlob } from '../../../Helpers/Utility';
import {
    CAMERA_ERROR, CAMERA_NOT_FOUND,
    CAMERA_PERMISSION_DENIED, CANCEL, CROP_PHOTO,
    PERMISSION_DENIED, PROFILE,
    REACT_APP_PROFILE_NAME_CHAR,
    REACT_APP_STATUS_CHAR,
    REMOVE, REMOVE_PHOTO,
    REMOVE_YOUR_PROFILE_PHOTO, TAKE_PHOTO,
    UPLOAD_PHOTO, VIEW_PHOTO
} from '../../processENV';
import SDK from '../../SDK';
import { WebChatCropOption } from '../CroppieImage/WebChatCropOption';
import WebChatCroppie from '../CroppieImage/WebChatCroppie';
import WebChatCamera from './WebChatCamera';
import WebChatFields from './WebChatFields';
import { NO_INTERNET, PROFILE_UPDATE_SUCCESS } from '../../../Helpers/Constants';
import ProfileImage from '../Common/ProfileImage';

const indexedDb = new IndexedDb();

var cropme;
class WebChatVCard extends React.Component {
    /**
     * Following the states used in WebChatVCard Component.
     *
     * @param {object} vCardData VCard Data set into this state.
     * @param {boolean} viewProfileStatus Display the profile data into popup to maintain in this state.
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
            vCardData: "",
            viewProfileStatus: false,
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
            openCropy: false
        }
        this.localDb = new IndexedDb()
    }

    /**
     * componentDidMount() method is one of the lifecycle method.
     *
     * In this method to handle loader status and call the handleProfileImg().
     */
    componentDidMount() {
        if ((this.props.vCardData && this.props.vCardData.id) || this.state.vCardData.length !== 0) {
            this.setState({
                vCardData: this.props.vCardData.data
            });
            this.handleProfileImg(this.props);
        }
    }

    /**
     * componentDidUpdate() method to check the prevProps and current props vCardData and update the profile image.
     *
     * @param {object} prevProps
     * @param {object} prevState
     */
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.vCardData && prevProps.vCardData.id !== this.props.vCardData.id) {
            this.setState({
                vCardData: this.props.vCardData.data
            });
            this.handleProfileImg(this.props);
        }
    }

    /**
     * handleProfileImg() method to perform fetch the image form url and encrypt the vcard data.
     *
     * @param {object} response
     */
    handleProfileImg(response) {
        let token = ls.getItem('token');
        if (response.vCardData.data.image && token) {
            this.localDb.getImageByKey(response.vCardData.data.image, 'profileimages').then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                this.setState({ profileImg: blobUrl });
            }).catch(err => {
                this.setState({ profileImg: SampleProfile });
            })
        } else {
            this.setState({ profileImg: SampleProfile, showProfileImg: false });
        }
    }

    /**
     * handleCropImage() to load the loader for croppie.
     */
    handleCropImage() {
        this.setState({ loaderIcon: true }, () => this.cropImage());
    }

    /**
     * cropImage() to crop the selected image.
     */
    cropImage = () => {
        cropme.result({
            type: "base64",
            size: "original"
        }).then(base64 => {
            const imageFile = dataURLtoFile(base64, this.state.filename);
            this.setState({
                loaderIcon: true
            }, () => this.handleSaveImage(imageFile))
        })
    }

    /**
     * handleSaveImage() to save the selected image.
     */
    handleSaveImage = async (image) => {
        try {
            let vCardData = this.state.vCardData;
            const response = await SDK.setUserProfile(vCardData.nickName, image, vCardData.status, vCardData.mobileNumber, vCardData.email)
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
                this.setState({ profileImg: URL.createObjectURL(fileBlob) })
                indexedDb.setImage(response.fileToken, fileBlob, "profileimages");
                toastr.success(PROFILE_UPDATE_SUCCESS);
            }

            this.handleProfileCameraPopupClose();
        } catch (error) {
            toastr.error(error.message);
            this.handleProfileCameraPopupClose();
        }
    }

    /**
     * updateProfileImage() to get image file from child component.
     */
    updateProfileImage = (file) => {
        if (cropme) {
            cropme.destroy();
        }
        if (file) {
            this.setState({
                filename: file.name,
                camImage: file,
                cameraPopup: true
            }, () => {
                const element = document.getElementById("CameraContainer")
                cropme = new Cropme(element, WebChatCropOption);
                var reader = new FileReader();
                reader.onload = function (e) {
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
                reader.readAsDataURL(file);
            })
        }
    }

    /**
     * handleViewProfile() method to maintain state for view profile popup.
     */
    handleViewProfile = () => {
        this.setState({ viewProfileStatus: true });
    }

    /**
     * handleVCardClose() method to maintain state for view profile popup close window state.
     */
    handleVCardClose = () => {
        this.setState({
            userNameChars: REACT_APP_PROFILE_NAME_CHAR - this.props.vCardData.data.nickName.length,
            statusChars: REACT_APP_STATUS_CHAR - this.props.vCardData.data.status.length,
            viewProfileStatus: false,
            viewEmojiUsername: false,
            userName: this.props.vCardData.data.nickName,
            userStatus: this.props.vCardData.data.status,
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
        let { vCardData } = this.state;
        let response = await SDK.setUserProfile(vCardData.nickName, "", vCardData.status, vCardData.mobileNumber, vCardData.email);
        if (response.statusCode === 200) {
            this.setState({
                showImgDropDown: false,
                openCropy: false,
                showProfilePhotoRemove: false
            });
            toastr.success('Profile picture removed successfully');
        } else {
            toastr.error(response.message);
        }
    }

    /**
     * setWebcamImageVcard() method to maintain state to set a image taken from webcamera.
     */
    setWebcamImageVcard = (webcamImageVcard = {}) => {
        if (webcamImageVcard.size > 0) {
            let file = new FileReader();
            file.readAsDataURL(webcamImageVcard);
            file.onload = () => {
                let fileImage = file.result;
                this.setState({
                    photoTaken: true, camImageDisplay: fileImage, camImage: webcamImageVcard
                }, () => this.updateProfileImage(webcamImageVcard))
            }
        } else {
            this.setState({ showProfileCamera: true })
        }
    }

    /**
     * onCameraCheckVcard() method to find whether camera device is there.
     */
    onCameraCheckVcard = (errorVacrd = {}) => {
        if (errorVacrd.name === "NotAllowedError") {
            this.setState({ onCameraPermissionDenied: true });
        } else if (errorVacrd.name === "NotFoundError") {
            this.setState({ onCameraError: true })
        }
    }

    /**
     * handleProfileImgDropDownVcard() method to maintain state to show dropdown in profile page.
     */
    handleProfileImgDropDownVcard = (e) => {
        this.setState({
            showImgDropDown: !this.state.showImgDropDown, openCropy: true
        })
    }

    /**
     * handleProfileImageShow() method to maintain state to show profile image in big screen.
     */
    handleProfileImageShow = (e) => {
        this.setState({ showProfileImg: true, showImgDropDown: false, openCropy: false });
    }

    /**
     * handleProfileImgClose() method to maintain state to close profile image.
     */
    handleProfileImgClose = (e) => {
        this.setState({ showProfileImg: false });
    }

    /**
     * handleProfileCameraShow() method to open camera popup.
     */
    handleProfileCameraShow = (e, processType) => {
        if (processType !== 'reset' && blockOfflineAction()) return;
        this.setState({ showProfileCamera: true, showImgDropDown: false, openCropy: false, photoTaken: false, cameraLoader: true });
    }

    /**
     * handleProfilePhotoRemoveShow() method to open profile photo remove prompt.
     */
    handleProfilePhotoRemoveShow = (e) => {
        if (blockOfflineAction()) return;
        this.setState({ showProfilePhotoRemove: true, showImgDropDown: false, openCropy: false });
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
            showImgDropDown: false,
            openCropy: false
        });
    }

    checkNotFound = (event) => {
        event.target.src = SampleProfile
    }
    closeDropDown = () => {
        this.setState({
            showImgDropDown: false
        });
    };

    /**
     * webChat page renderBased on condition
    */
    WebChatCroppieLoad = (loaderIcon = false, cameraPopup = false) => {
        return (
            <WebChatCroppie
                type={PROFILE}
                loader={loaderIcon}
                cameraPopup={cameraPopup}
                cropImage={this.cropImage}
                closeDropDown={this.closeDropDown}
                updateProfileImage={this.updateProfileImage}
                closePopUp={this.handleProfileCameraPopupClose}
            />
        )
    };
    /**
     * render() method to render the WebChatVCard Component into browser.
     */
    render() {
        let { viewProfileStatus,
            profileImg,
            showImgDropDown,
            showProfileImg,
            showProfileCamera,
            showProfilePhotoRemove,
            photoTaken,
            onCameraError,
            loaderIcon,
            cameraPopup,
            openCropy = false,
            onCameraPermissionDenied } = this.state;
        let { vCardData } = this.props;

        return <Fragment>
            {vCardData && vCardData.data && <>
                <div className="profile-img-name" onClick={(e) => this.handleViewProfile(e)}>
                    <div className="image">
                        <ProfileImage
                            chatType={'chat'}
                            imageToken={vCardData.data.image}
                            temporary={true}
                            name={vCardData.data.nickName}
                        />
                    </div>
                    <span title={renderHTML(vCardData.data.nickName)}>{renderHTML(vCardData.data.nickName)}</span>
                </div>
                {viewProfileStatus && <div className="userprofile">
                    <OutsideClickHandler
                        onOutsideClick={() => {
                            this.setState({ viewProfileStatus: false });
                        }}>

                        <div className="userprofile-popup">
                            <div className="userprofile-header">
                                <i onClick={(e) => this.handleVCardClose(e)}>
                                    <ClosePopup />
                                </i>
                                <h5>{"Profile"}</h5>
                            </div>
                            <div className="userprofile-body">
                                <div className="userprofile-image">
                                    <OutsideClickHandler
                                        onOutsideClick={() => {
                                            this.setState({ showImgDropDown: false, openCropy: false });
                                        }}>
                                        {/* user image empty no perview button */}
                                        <ProfileImage
                                        chatType={'chat'}
                                        imageToken={vCardData.data.image}
                                        temporary={true}
                                        name={vCardData.data.nickName}
                                        profileImageView={(e) => profileImg !== SampleProfile ? this.handleProfileImageShow(e) : null}
                                        />
                                        <i className="camera-edit" onClick={(e) => this.handleProfileImgDropDownVcard(e)}>
                                            <EditCamera />
                                        </i>
                                        {showImgDropDown &&
                                            <React.Fragment>
                                                <ul className="profile-dropdown">
                                                    {profileImg && <>
                                                        {profileImg !== SampleProfile && <li title={VIEW_PHOTO} onClick={(e) => this.handleProfileImageShow(e)}>
                                                            <i className="profileedit-options"><Viewphoto /></i><span>{VIEW_PHOTO}</span></li>}
                                                        <li title={TAKE_PHOTO} onClick={(e) => this.handleProfileCameraShow(e)}><i className="profileedit-options"><Takephoto /></i><span>{TAKE_PHOTO}</span></li>
                                                        {profileImg !== SampleProfile && <li title={REMOVE_PHOTO} onClick={(e) => this.handleProfilePhotoRemoveShow(e)}>
                                                            <i className="profileedit-options"><Remove /></i>
                                                            <span>{REMOVE_PHOTO}</span></li>}
                                                        <li className="upload_photo" title={UPLOAD_PHOTO}> 
                                                            <label className="UploadLabel" htmlFor="ProfileUpload"></label>
                                                            <i className="profileedit-options"><Upload /></i>
                                                            <span className="uploadphoto">
                                                                <span>{UPLOAD_PHOTO}</span>
                                                            </span>
                                                        </li>
                                                    </>}

                                                    {!profileImg && <>
                                                        <li title={TAKE_PHOTO} onClick={(e) => this.handleProfileCameraShow(e)}><i className="profileedit-options"><Takephoto /></i><span>{TAKE_PHOTO}</span></li>
                                                        <li title={UPLOAD_PHOTO}>
                                                            <label className="UploadLabel" htmlFor="ProfileUpload"></label>
                                                            <i className="profileedit-options"><Upload /></i>
                                                            <span className="uploadphoto">
                                                                <span>{UPLOAD_PHOTO}</span>
                                                            </span>
                                                        </li>
                                                    </>}
                                                </ul>
                                            </React.Fragment>}
                                        <React.Fragment>
                                            {openCropy &&
                                                <>
                                                    {this.WebChatCroppieLoad(loaderIcon, cameraPopup)}
                                                </>
                                            }
                                        </React.Fragment>
                                        {showProfileImg && <div className="Viewphoto-container">
                                            <div className="Viewphoto-preview">
                                                <img src={profileImg} alt="vcard-profile" />
                                                <i className="preview-close" onClick={(e) => this.handleProfileImgClose(e)}><ClosePopup /></i>
                                            </div>
                                        </div>}
                                        {showProfileCamera && <div className="camera-container">
                                            {onCameraError &&
                                                <div className="camera-popup">
                                                    <h4>{CAMERA_NOT_FOUND}</h4>
                                                    <i>
                                                        <CameraIcon />
                                                    </i>
                                                    <p>{CAMERA_ERROR}</p>
                                                    <div className="popup-controls">
                                                        <button type="button" className="btn-okay" onClick={(e) => this.handleProfileCameraClose(e)} name="btn-cancel">{"Okay"}</button>
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
                                                        <button type="button" className="btn-okay" onClick={(e) => this.handleProfileCameraClose(e)} name="btn-cancel">{"Okay"}</button>
                                                    </div>
                                                </div>}

                                            {!onCameraError && !onCameraPermissionDenied &&
                                                <div className="camera-popup-visible">
                                                    <div className="userprofile-header">
                                                        <i onClick={(e) => this.handleProfileCameraClose(e)}><ClosePopup /></i>
                                                        {photoTaken ? <h5>{CROP_PHOTO}</h5> : <h5>{TAKE_PHOTO}</h5>}
                                                    </div>
                                                    <div className="cameraview">
                                                        {photoTaken &&
                                                            <div id='CameraContainer'></div>
                                                        }
                                                        {!photoTaken &&
                                                            <WebChatCamera sendFile={this.setWebcamImageVcard} onCameraCheck={this.onCameraCheckVcard} />}
                                                    </div>
                                                    {photoTaken &&
                                                        <div className="popup-controls">
                                                            {!this.state.loaderIcon && < i title="Re capture"> <Reset onClick={(e) => this.handleProfileCameraShow(e, 'reset')} /></i>}
                                                            {!this.state.loaderIcon ? <i title="Update Profile" onClick={(e) => this.handleCropImage()}><Tick /></i> :
                                                                <img src={loaderGIF} alt="loader" />
                                                            }
                                                        </div>
                                                    }
                                                </div>}
                                        </div>}
                                        {showProfilePhotoRemove && <div className="removephoto-container">
                                            <div className="removephoto-popup">
                                                <div className="removephoto-label">
                                                    <label>{REMOVE_YOUR_PROFILE_PHOTO}</label>
                                                </div>
                                                <div className="removephoto-noteinfo">
                                                    <button type="button" className="btn-cancel" onClick={(e) => this.handleProfileRemovephotoClose(e)} name="btn-cancel">{CANCEL}</button>
                                                    <button type="button" className="btn-removephoto" onClick={(e) => this.removeProfileImage(e)} name="btn-remove" >{REMOVE}</button>
                                                </div>
                                            </div>
                                        </div>}</OutsideClickHandler >
                                </div>
                                <WebChatFields />
                            </div>
                        </div>
                    </OutsideClickHandler >
                </div>}
            </>
            }
        </Fragment>
    }
}

const mapStateToProps = (state, props) => {
    return ({
        vCardData: state.vCardData
    });
};

export default connect(mapStateToProps, null)(WebChatVCard);
