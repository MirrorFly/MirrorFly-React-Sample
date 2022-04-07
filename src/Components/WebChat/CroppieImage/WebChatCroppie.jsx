import React, { Fragment } from 'react';
import toastr from 'toastr';
import { ClosePopup, loaderGIF, Reset, Tick } from '../../../assets/images';
import {
    CROP_PHOTO, IMAGE_TYPE_ONLY_ALLOWED
} from '../../processENV';

class WebChatCroppie extends React.Component {
    /**
     * handleProfileCameraClose() to close the crop template.
     */
    handleProfileCameraClose = (e) => {
        this.props.closePopUp()
    }

    /**
     * validateBeforeUpload() to validate the uploaded image.
     */
    validateBeforeUpload = (file = {}) => {
        this.setState({ file: file });
        const fileName = file.name;

        if (!(/\.(jpe?g|png|gif|bmp)$/i.test(fileName))) {
            return {
                messsage: IMAGE_TYPE_ONLY_ALLOWED,
                error: true
            }
        }
        return {
            error: false
        };
    }

    /**
     * fileChangedHandler() to handle the validations.
     */
    fileChangedHandler = event => {
        const file = event.target.files[0];
        const isValid = this.validateBeforeUpload(file);
        event.target.value = "";
        if (isValid.error) {
            toastr.error(isValid.messsage)
            event.preventDefault();
        } else {
            this.props.updateProfileImage(file);
        }
    }

    /**
     * handleTick() to save the cropped image in parent component.
     */
    handleTick = (e) => {
        this.props.cropImage()
    }

    /**
     * render() method to render the WebChatCroppie Component into browser.
     */
    render() {
        const loaderStyle = {
            width: 30,
            height: 29
        }
        const { loader, cameraPopup } = this.props
        return (
            <Fragment>
                <input
                    type="file"
                    accept="image/*"
                    id="ProfileUpload"
                    onChange={this.fileChangedHandler}
                    onClick={this.props?.closeDropDown}
                    data-jest-id={"jestfileChangedHandler"}
                />
                <label className="UploadLabel" htmlFor="ProfileUpload"></label>
                {cameraPopup &&
                    <div className="camera-container">
                        <div className="camera-popup-visible">
                            <div className="userprofile-header">
                                <i
                                    data-jest-id={"jesthandleProfileCameraClose"}
                                    onClick={(e) => this.handleProfileCameraClose(e)}
                                >
                                    <ClosePopup /></i>
                                <h5>{CROP_PHOTO}</h5>
                            </div>
                            <div className="cameraview">
                                <div id='CameraContainer'></div>
                            </div>
                            <div className="popup-controls">
                                {!loader &&
                                    <Fragment>
                                        <i className="reset picturerReset" title="Re capture">
                                            <label htmlFor="Reset"><Reset />
                                                <input
                                                    id="Reset"
                                                    type="file"
                                                    accept="image/*"
                                                    className="imageSelect"
                                                    onChange={this.fileChangedHandler}
                                                />
                                            </label>
                                        </i>
                                        <i className="pictureUpdate" title="Update Profile">
                                            <Tick
                                                onClick={this.handleTick}
                                                data-jest-id={"jesthandleTick"}
                                            />
                                        </i>
                                    </Fragment>
                                }
                                {loader && <img src={loaderGIF} alt="loader" style={loaderStyle} />}
                            </div>
                        </div>
                    </div>}
            </Fragment>
        )
    }
}

export default WebChatCroppie;
