import React from "react";
import { SingleForward2 } from "../../../../../assets/images";
import Modal from "../../../Common/Modal";
import ForwardPopUp from "../../../PopUp/Forward";
const ForwardCommon = (props = {}) => {
    const {
        jid = "",
        forward,
        popUpStatus,
        uploadStatus = 0,
        showForwardPopUp,
        closeForwardPopUp,
        pageType,
        messageType,
        mediaUrl,
        imgSrc
    } = props;
    return (
        <React.Fragment>
            {((((messageType != "meet" && messageType != "audio" && messageType != "image") || (messageType == "image" && imgSrc.search("blob:") !== -1 ) || (messageType == "audio" && mediaUrl)) && uploadStatus === 2) || messageType == "meet") && !forward && pageType === "conversation" && (
                <span title="Forward" className="SingleForward" onClick={showForwardPopUp}>
                    <i>
                        <SingleForward2 />
                    </i>
                </span>
            )}

            {popUpStatus && (
                <Modal containerId="container">
                    <ForwardPopUp activeJid={jid} closeMessageOption={closeForwardPopUp} closePopup={closeForwardPopUp} />
                </Modal>
            )}
        </React.Fragment>
    );
};

export default ForwardCommon;
