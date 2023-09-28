import React from 'react';
import CapturePicture from './CapturePicture';
import { RETAKE, TAKE_PHOTO } from '../../processENV';
import { ClosePopup, Retake } from '../../../assets/images';

const TakeCameraPicture = (props = {}) => {
    const {
        imgSrc = "",
        cropEnabled,//click
        onCameraCheck,//click
        loader = false,
        setWebcamImage,//click
        handleCropImage,//click
        handleCameraShow,//click
        photoTaken = false,
        handleCameraPopupClose,//click
    } = props;
    return (
        <div className="camera-popup-visible">
            <div className="userprofile-header">
                {photoTaken && !loader ? '' : <h5>{TAKE_PHOTO}</h5>}
                {
                    photoTaken && !loader &&
                    <span
                        data-jest-id={"jesthandleCameraShow"}
                        onClick={(e) => handleCameraShow(e)}>
                        <i><Retake /></i>
                        {RETAKE}
                    </span>
                }
                <i
                    data-jest-id={"jesthandleCameraPopupClose"}
                    onClick={(e) => handleCameraPopupClose(e)}
                >
                    <ClosePopup /></i>
            </div>
            <CapturePicture
                loader={loader}
                imgSrc={imgSrc}
                photoTaken={photoTaken}
                isRetake={props.retake}
                cropEnabled={cropEnabled}
                onCameraCheck={onCameraCheck}
                setWebcamImage={setWebcamImage}
                handleCropImage={handleCropImage}
                chatType ={props.chatType}
                chatId={props.chatId}
            />
        </div>
    )
}
export default TakeCameraPicture;
