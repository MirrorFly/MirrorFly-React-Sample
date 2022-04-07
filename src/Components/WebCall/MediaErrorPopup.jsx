import React, { Component } from 'react'
import { connect } from 'react-redux';
import { hideModal } from '../../Actions/PopUp';

class MediaErrorPopup extends Component {

    render() {
        const { closePopup } = this.props
        const { popUpData:{ modalProps:{ callProcess, modelType, callType, device } } } = this.props;

        let content = "Microphone access required to continue the audio call, please enable and try again!";
        if(modelType === 'mediaPermissionDenied' && callType === 'video' && ['makeCall', 'attendCall'].indexOf(callProcess) > -1){
            content = "Camera and Microphone access required to continue video call, please enable and try again!";
        }
        else if(modelType === 'mediaPermissionDenied' && ['callConversion', 'videoUnMute'].indexOf(callProcess) > -1){
            content = "Camera access required to share the video, please enable and try again!";
        }
        else if(device === 'mic' && modelType === 'mediaAccessError'){
            content = "Seems like you have a problem with your microphone, please check and try again!";
        }
        else if(device === 'camera' && modelType === 'mediaAccessError'){
            content = "Seems like you have a problem with your camera, please check and try again!";
        }

        return (
            <div className="popup-wrapper action-permission">
                <div className="popup-container">
                    <div className="popup-container-inner">
                        <div className="popup-container-header">
                            {/* <i className="closePopup"><Close2 /></i> */}
                        </div>
                        <div className="popup-body">
                        <div className="popup-label">
                            <div className="label">
                                {content}
                            </div>
                        </div>
                        </div>
                        <div className="popup-noteinfo">
                            <button onClick={closePopup} type="button" className="btn-cancel">close</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


const mapStateToProps = (state, props) => {
    return {
        popUpData: state.popUpData
    }
}
const mapDispatchToProps = {
    closePopup: hideModal
}


export default connect(mapStateToProps, mapDispatchToProps)(MediaErrorPopup);

