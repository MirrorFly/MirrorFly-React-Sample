import React from 'react';
import { CameraIcon } from '../../../assets/images';
import {
    CAMERA_ERROR, CAMERA_NOT_FOUND,
} from '../../processENV';

const CameraNotFound = (props = {}) => {
    const {
        handleCameraPopupClose,//click
    } = props;
    return (
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
                    onClick={(e) => handleCameraPopupClose(e)}
                    data-jest-id={"jesthandleCameraPopupClose"}
                    >
                    {"Okay"}
                </button>
            </div>
        </div>
    )
}
export default CameraNotFound;
