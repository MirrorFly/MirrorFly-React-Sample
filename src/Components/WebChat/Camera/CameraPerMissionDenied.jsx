import React from 'react';
import { CameraIcon, } from '../../../assets/images';
import { CAMERA_PERMISSION_DENIED, PERMISSION_DENIED, } from '../../processENV';

const CameraPerMissionDenied = (props = {}) => {
    const {
        handleCameraPopupClose,//click
    } = props;
    return (
        <div className="camera-popup">
            <h4>
                {PERMISSION_DENIED}
            </h4>
            <i><CameraIcon /></i>
            <p>
                {CAMERA_PERMISSION_DENIED}
            </p>
            <div
                className="popup-controls">
                <button
                    type="button"
                    name="btn-cancel"
                    className="btn-okay"
                    data-id={"jestHandleCameraPopupClose"}
                    onClick={(e) => handleCameraPopupClose(e)}
                >
                    {"Okay"}
                </button>
            </div>
        </div>
    )
}
export default CameraPerMissionDenied;
