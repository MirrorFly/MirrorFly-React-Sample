import ReactDOM from 'react-dom';
import _toArray from "lodash/toArray";
import Cropme from 'croppie';
import 'croppie/croppie.css';
import React, { Component, Fragment } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import {
    ArrowBack, CameraIcon, ClosePopup, CreateGroup, EditCamera, Info, loaderGIF,
    Remove, Reset, GroupProfile, Takephoto, Tick, Upload, Viewphoto
} from '../../../assets/images';
import WebChatCroppie from '../CroppieImage/WebChatCroppie';
import WebChatCamera from '../WebChatVCard/WebChatCamera';
import "./newGroup.scss";
import "../Common/popup.scss";
import { WebChatCropOption } from '../CroppieImage/WebChatCropOption';

import {
    CAMERA_ERROR, CAMERA_NOT_FOUND,
    CAMERA_PERMISSION_DENIED, CANCEL, CROP_PHOTO,
    PERMISSION_DENIED, PROFILE,
    REACT_APP_GROUP_NAME_CHAR, REMOVE, REMOVE_PHOTO,
    REMOVE_YOUR_PROFILE_PHOTO, TAKE_PHOTO,
    UPLOAD_PHOTO, VIEW_PHOTO
} from '../../processENV';
import WebChatEmoji from '../../WebChat/WebChatEmoji';
import { removeMoreNumberChar } from "../../../Helpers/Chat/ContentEditableEle"
import { dataURLtoFile } from '../../../Helpers/Utility';
var cropme;
export default class NewGroupProfile extends Component {
    constructor(props) {
        super(props)
        const { typingMessage = '', groupProfileImage } = props
        this.state = {
            loading: '',
            loaderIcon: false,
            cameraPopup: false,
            showProfileImg: false,
            showProfileCamera: false,
            onCameraPermissionDenied: false,
            onCameraError: false,
            showImgDropDown: false,
            showEmoji: false,
            typingMessage: typingMessage,
            groupProfileImage: groupProfileImage,
            errorMessage: false,
            groupNameChars: REACT_APP_GROUP_NAME_CHAR - typingMessage.length,
        }
    }

    /**
     * handleCropImage() to load the loader for croppie.
     */
    handleCropImage() {
        this.setState({ loaderIcon: true }, () => this.cropImage());
    }

    componentDidMount() {
        this.groupNameInput.focus();
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
            }, () => this.aftercropedImage(imageFile))
        })
    }

    /**
     * handleSaveImage() to save the selected image.
     */
    aftercropedImage = file => {
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(file);
        this.setState({
            groupProfileImage: imageUrl,
            errorMessage: false
        }, () => {
            return this.handleProfileCameraPopupClose()
        })
    };

    /**
     * updateProfileImageNewImg() to get image file from child component.
     */
    updateProfileImageNewImg = (fileNewProfile = {}) => {
        if (cropme) {
            cropme.destroy();
        }
        if (fileNewProfile) {
            this.setState({
                filename: fileNewProfile.name,
                camImage: fileNewProfile,
                cameraPopup: true
            }, () => {
                const elementNewProfile = document.getElementById("CameraContainer")
                cropme = new Cropme(elementNewProfile, WebChatCropOption);
                var readerNewProfile = new FileReader();
                readerNewProfile.onload = function (e) {
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
                readerNewProfile.readAsDataURL(fileNewProfile);
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
            viewProfileStatus: false,
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
        this.setState({
            showProfilePhotoRemove: false,
            groupProfileImage: ''
        });
    }

    /**
     * setWebcamImage() method to maintain state to set a image taken from webcamera.
     */
    setWebcamImages = (webcamImages = {}) => {
        if (webcamImages.size > 0) {
            let file = new FileReader();
            file.readAsDataURL(webcamImages);
            file.onload = () => {
                let fileImages = file.result;
                this.setState({
                    photoTaken: true, camImageDisplay: fileImages, camImage: webcamImages
                }, () => this.updateProfileImageNewImg(webcamImages))
            }
        } else {
            this.setState({ showProfileCamera: true })
        }
    }

    /**
     * onCameraCheckGrupPic() method to find whether camera device is there.
     */
    onCameraCheckGrupPic = (errorsNewGrp = {}) => {
        if (errorsNewGrp.name === "NotAllowedError") {
            this.setState({ onCameraPermissionDenied: true });
        } else if (errorsNewGrp.name === "NotFoundError") {
            this.setState({ onCameraError: true })
        }
    }

    /**
     * handleNewProfileImgDropDown() method to maintain state to show dropdown in profile page.
     */
    handleNewProfileImgDropDown = (e) => {
        e.stopPropagation();
        this.setState({ showImgDropDown: !this.state.showImgDropDown })
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
    handleProfileCameraShow = (e) => {
        this.setState({ showProfileCamera: true, showImgDropDown: false, photoTaken: false, cameraLoader: true });
    }

    /**
     * handleProfilePhotoRemoveShow() method to open profile photo remove prompt.
     */
    handleProfilePhotoRemoveShow = (e) => {
        this.setState({
            showProfilePhotoRemove: true,
            showImgDropDown: false,
            groupProfileImage: ''
        });
    }

    /**
     * handleProfileRemovephotoClose() method to close profile photo remove prompt.
     */
    handleProfileRemovephotoClose = (e) => {
        this.setState({ showProfilePhotoRemove: false });
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
        event.target.src = GroupProfile
    }

    afterImageLoad = (event) => event.target.style.backgroundImage = '';

    findNegativeValue = (message = "") => {
        const groupNameLength = REACT_APP_GROUP_NAME_CHAR - _toArray(message).length;
        if (groupNameLength >= 0) {
            return REACT_APP_GROUP_NAME_CHAR - _toArray(message).length;
        }
        return 0;
    };

    handleMessage = (event = {}) => {
        const { value = "" } = event.target;
        const message = removeMoreNumberChar(REACT_APP_GROUP_NAME_CHAR, value);
        this.setState({
            typingMessage: message,
            groupNameChars: this.findNegativeValue(message),
            errorMessage: false
        });
    }

    handleEmojiText = (emojiObject = "") => {
        const { typingMessage = "" } = this.state;
        const message = removeMoreNumberChar(REACT_APP_GROUP_NAME_CHAR, typingMessage + emojiObject);
        this.setState({
            typingMessage: message,
            groupNameChars: this.findNegativeValue(message),
            errorMessage: false
        });
    }


    /**
     * handleProfileImageShow() method to maintain state to show profile image in big screen.
     */
    handleProfileImageShow = (e) => {
        this.setState({ showProfileImg: true, showImgDropDown: false });
    }

    nextScreen = () => {
        const { typingMessage, groupProfileImage } = this.state
        if (!typingMessage) {
            this.setState({
                errorMessage: true
            })
            return
        }
        this.props.handleMoveToPartcipantList({
            typingMessage, groupProfileImage, profileImage: true
        })
    };

    closeDropDown = () => {
        console.log("closeDropDown");
    };

    render() {
        const { handleBackToRecentChat } = this.props
        const { showProfileCamera, onCameraError, onCameraPermissionDenied,
            photoTaken, showProfilePhotoRemove, showProfileImg,
            showImgDropDown, loaderIcon, cameraPopup, showEmoji,
            typingMessage, groupProfileImage, errorMessage, groupNameChars } = this.state;
        return (
            <OutsideClickHandler
                onOutsideClick={() => {
                    this.setState({ showImgDropDown: false });
                }}>
                <Fragment>
                    <div className="contactlist ">
                        <div className="recent-chatlist-header">
                            <div className="profile-img-name">
                                <i className="newchat-icon" onClick={handleBackToRecentChat} title="Back">
                                    <ArrowBack />
                                </i>
                                <span>{"New Group"}</span>
                                <div title="Select group members" onClick={this.nextScreen}>Next
                                        <i className="nextGroup-icon"  >
                                        <CreateGroup />
                                    </i>
                                </div>
                            </div>
                        </div>
                        <div className="newgroup-details-container">
                            <div className="group-details-inner">
                                <div className="group-image-container">
                                    <div className="group-image-inner">
                                        {groupProfileImage &&
                                            <img src={groupProfileImage} onClick={(e) => this.handleProfileImageShow(e)} onError={this.checkNotFound} alt="Group Profile" />
                                        }
                                        {!groupProfileImage &&
                                            <span onClick={(e) => this.handleNewProfileImgDropDown(e)} className="createNewGroup">
                                                <img src={groupProfileImage} onError={this.checkNotFound} alt="Group Profile" />
                                            </span>
                                        }
                                        <i className="camera-edit" onClick={(e) => this.handleNewProfileImgDropDown(e)}>
                                            <EditCamera />
                                        </i>
                                        {showImgDropDown &&
                                            <ul className="menu-dropdown">
                                                {groupProfileImage &&
                                                    <li className="ViewPhoto" title={VIEW_PHOTO}
                                                        onClick={(e) => this.handleProfileImageShow(e)}>
                                                        <i className="profileedit-options"><Viewphoto />
                                                        </i><span>{VIEW_PHOTO}</span></li>
                                                }
                                                <li className="TakePhoto" title="Take Photo" onClick={(e) => this.handleProfileCameraShow(e)}>
                                                    <i><Takephoto /></i><span>Take Photo</span></li>
                                                {groupProfileImage &&
                                                    <li className="RemovePhoto" title={REMOVE_PHOTO} onClick={(e) => this.handleProfilePhotoRemoveShow(e)}>
                                                        <i className="profileedit-options"><Remove /></i>
                                                        <span>{REMOVE_PHOTO}</span></li>
                                                }
                                                <li className="UploadPhoto" title="Upload Photo"><i><Upload /></i>
                                                    <span className="uploadphoto"><span>{UPLOAD_PHOTO}</span>
                                                        <WebChatCroppie
                                                            closeDropDown={this.closeDropDown}
                                                            loader={loaderIcon}
                                                            cameraPopup={cameraPopup}
                                                            closePopUp={this.handleProfileCameraPopupClose}
                                                            type={PROFILE}
                                                            updateProfileImage={this.updateProfileImageNewImg}
                                                            cropImage={this.cropImage} />
                                                    </span>
                                                </li>
                                            </ul>
                                        }
                                    </div>
                                </div>
                                <div className="form-control">
                                    <input
                                        type="text"
                                        ref={el => this.groupNameInput = ReactDOM.findDOMNode(el)}
                                        value={typingMessage}
                                        onChange={this.handleMessage}
                                        placeholder="Type group name here..."
                                        maxLength={this.findNegativeValue(typingMessage) > 0 ? 1000 : 0}
                                    />
                                    <span className="char-count">{groupNameChars}</span>
                                    <i className="emoji"><WebChatEmoji showEmoji={showEmoji} onEmojiClick={this.handleEmojiText} /></i>
                                    {errorMessage && <div className="errorMessage"><Info /><span>Please provide group name</span></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="userprofile-popup groupProfile">
                        <div className="userprofile-body">
                            <div className="userprofile-image">
                                {showProfileImg && <div className="Viewphoto-container">
                                    <div className="Viewphoto-preview">
                                        <img src={groupProfileImage} alt="vcard-profile" />
                                        <i className="preview-close" onClick={(e) => this.handleProfileImgClose(e)}><ClosePopup /></i>
                                    </div>
                                </div>}

                                {showProfileCamera && <div className="camera-container" title="">
                                    {onCameraError &&
                                        <div className="camera-popup">
                                            <h4>{CAMERA_NOT_FOUND}</h4>
                                            <i>
                                                <CameraIcon />
                                            </i>
                                            <p>{CAMERA_ERROR}</p>
                                            <div className="popup-controls">
                                                <button type="button" className="btn-okay" onClick={(e) => this.handleProfileCameraPopupClose(e)} name="btn-cancel">{"Okay"}</button>
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
                                                <button type="button" className="btn-okay" onClick={(e) => this.handleProfileCameraPopupClose(e)} name="btn-cancel">{"Okay"}</button>
                                            </div>
                                        </div>}

                                    {!onCameraError && !onCameraPermissionDenied &&
                                        <div className="camera-popup-visible">
                                            <div className="userprofile-header">
                                                <i onClick={(e) => this.handleProfileCameraPopupClose(e)}><ClosePopup /></i>
                                                {photoTaken ? <h5>{CROP_PHOTO}</h5> : <h5>{TAKE_PHOTO}</h5>}
                                            </div>
                                            <div className="cameraview">
                                                {photoTaken &&
                                                    <div id='CameraContainer'></div>
                                                }
                                                {!photoTaken &&
                                                    <WebChatCamera sendFile={this.setWebcamImages} onCameraCheck={this.onCameraCheckGrupPic} />}
                                            </div>
                                            {photoTaken &&
                                                <div className="popup-controls">
                                                    {!this.state.loaderIcon && < i title="Re capture" > <Reset onClick={(e) => this.handleProfileCameraShow(e)} /></i>}
                                                    {!this.state.loaderIcon ? <i title="Update Profile" onClick={(e) => this.handleCropImage()}><Tick /></i> :
                                                        <img src={loaderGIF} alt="loader" />
                                                    }
                                                </div>
                                            }
                                        </div>}
                                </div>}
                                {showProfilePhotoRemove &&
                                    <div className="removephoto-container">
                                        <div className="removephoto-popup">
                                            <div className="removephoto-label">
                                                <label>{REMOVE_YOUR_PROFILE_PHOTO}</label>
                                            </div>
                                            <div className="removephoto-noteinfo">
                                                <button type="button" className="btn-cancel" onClick={(e) => this.handleProfileRemovephotoClose(e)} name="btn-cancel">{CANCEL}</button>
                                                <button type="button" className="btn-removephoto" onClick={(e) => this.removeProfileImage(e)} name="btn-remove" >{REMOVE}</button>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </Fragment>
            </OutsideClickHandler>
        )
    }
}
