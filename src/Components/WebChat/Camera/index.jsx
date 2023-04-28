import React, { Component } from 'react';
import Cropme from 'croppie';
import 'croppie/croppie.css';
import './mediaAttachCamera.scss';
import CameraNotFound from './CameraNotFound';
import TakeCameraPic from './TakeCameraPicture';
import { loaderGIF, } from '../../../assets/images';
import * as crop from '../CroppieImage/WebChatCropOption';
import CameraPerMissionDenied from './CameraPerMissionDenied';
import { blockOfflineMsgAction, dataURLtoFile } from '../../../Helpers/Utility';

var cropme;
export default class Camera extends Component {

    constructor() {
        super();
        this.state = {
            showCamera: true,
            cameraError: false,
            permissionDenied: false,
            loader: false,
            photoTaken: false,
            imgSrc: loaderGIF,
            caption: ""
        }
    }

    handleCameraPopupClose = () => {
        this.setState({
            showCamera: false,
            photoTaken: true,
            cameraError: false,
            permissionDenied: false,
            loader: false
        });
        this.props.onClickClose();
    }
    componentWillUnmount() {
        this.props.stopCameraPermissionTracks && this.props.stopCameraPermissionTracks();
    }

    /**
     * setWebcamImage() method to maintain state to set a image taken from webcamera.
     */
    setWebcamImage = (webcamImage = {}) => {
        this.props.stopCameraPermissionTracks && this.props.stopCameraPermissionTracks();
        if (webcamImage.size > 0) {
            let file = new FileReader();
            file.readAsDataURL(webcamImage);
            file.onload = () => {
                let fileImage = file.result;
                this.setState({
                    photoTaken: true, camImageDisplay: fileImage, camImage: webcamImage
                }, () => this.onClickedImage(webcamImage))
            }
        } else {
            this.setState({ showCamera: true })
        }
    }

    /**
     * onCameraCheck() method to find whether camera device is there.
     */
    onCameraCheck = (error = {}) => {
        if (error.name === "NotAllowedError") {
            this.setState({ permissionDenied: true });
        } else if (error.name === "NotFoundError") {
            this.setState({ cameraError: true })
        }
    }

    /**
     * onClickedImage() to get image file from child component.
     */
    onClickedImage = (file = {}) => {
        let cropEnabled = this.props.cropEnabled;
        let cropOptions = cropEnabled ? crop.WebChatCropOption : crop.WebChatDontCropOption;
        if (cropme) {
            cropme.destroy();
        }
        if (file) {
            this.setState({
                filename: file.name,
                camImage: file,
                cameraPopup: true
            }, () => {
                const element = document.getElementById("CapturedContainer")
                cropme = new Cropme(element, cropOptions);
                var reader = new FileReader();
                reader.onload = (e) => {
                    if (cropEnabled) {
                        cropme.bind({
                            url: e.target.result
                        }).then(() => {
                            Object.assign(document.querySelector('.cr-viewport').style, {
                                width
                                    : '200px', height: '200px'
                            });
                            cropme.setZoom(0)
                        })
                    } else {
                        this.setState({ imgSrc: e.target.result })
                    }
                }
                reader.readAsDataURL(file);
            })
        }
    }

    /**
     * handleCropImage() to load the loader for croppie.
     */
    handleCropImage = (caption , mentionedUsersIds =[]) => {
        if (blockOfflineMsgAction()) return;
        this.setState({ loader: true }, () => this.cropImage(caption,mentionedUsersIds));
    }

    /**
     * cropImage() to crop the selected image.
     */
    cropImage = (caption = "",mentionedUsersIds = []) => {
        if (this.props.cropEnabled) {
            cropme.result({
                type: "base64",
                size: "original"
            }).then(base64 => {
                let imageFile = dataURLtoFile(base64, this.state.filename);
                this.setState({
                    loader: true
                }, () => this.aftercropedImage(imageFile, caption, mentionedUsersIds))
            })
        } else {
            this.aftercropedImage(this.state.camImage, caption, mentionedUsersIds);
        }
    }

    aftercropedImage = (file = {}, caption = "", mentionedUsersIds = []) => {
        file = new File([file], file['name'], { type: "image/png" });
        file.caption = caption;
        file.mentionedUsersIds = mentionedUsersIds;
        this.props.onSuccess(file);
    }

    handleCameraShow = (e) => {
        this.setState({ showCamera: true, photoTaken: false });
    }

    render() {
        const { cameraError, permissionDenied, photoTaken, showCamera } = this.state;
        return (
            <div>
                {
                    showCamera &&
                    <div className="camera-container mediaAttachCamera">
                        {
                            cameraError &&
                            <CameraNotFound
                                handleCameraPopupClose={this.handleCameraPopupClose}
                            />
                        }
                        {permissionDenied &&
                            <>
                                <CameraPerMissionDenied
                                    handleCameraPopupClose={this.handleCameraPopupClose}
                                />
                            </>
                        }
                        {!cameraError && !permissionDenied && showCamera &&
                            <TakeCameraPic
                                photoTaken={photoTaken}
                                imgSrc={this.state.imgSrc}
                                loader={this.state.loader}
                                onCameraCheck={this.onCameraCheck}
                                setWebcamImage={this.setWebcamImage}
                                cropEnabled={this.props.cropEnabled}
                                handleCropImage={this.handleCropImage}
                                handleCameraShow={this.handleCameraShow}
                                handleCameraPopupClose={this.handleCameraPopupClose}
                                chatType = {this.props.chatType}
                            />
                        }
                    </div>
                }
            </div>
        )
    }
}
