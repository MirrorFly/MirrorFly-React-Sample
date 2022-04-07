import React from 'react'
import "./BlockPopUp.scss";
import { dispatchErrorMessage } from '../Common/FileUploadValidation';
import { blockOfflineAction, isAppOnline } from '../../../Helpers/Utility';

export const ConformationPopup = (props) => {
    const { popUpToggleAction, dispatchAction, headerLabel,
        closeLabel, actionLabel ,label} = props

        const actionDispatch = () => {
            if(!isAppOnline()){
                blockOfflineAction()
             return
            }

            if (dispatchErrorMessage()) {
               if(label ==='ClearAction'){
                    dispatchAction({
                        isclear:true
                    })}
                else {
                    dispatchAction({
                        isclear:false
                    });
                }
            }
        }

    return(
        <div className="popup-wrapper BlockedPopUp">
        <div className="popup-container">
            <div className="popup-container-inner">
                <div className="popup-label"><label>{headerLabel}</label></div>
                <div className="popup-noteinfo">
                    <button type="button" className="popup btn-cancel" name="btn-cancel" onClick={popUpToggleAction}>{closeLabel}</button>
                    <button type="button" className="popup btn-action" name="btn-action" onClick={actionDispatch}>{actionLabel}</button>
                </div>
                {/* <div className="blockedInfo">
                    <p><i><BlockedInfo/></i><span>On unblocking, this contact will able to call you or send messages to you.</span></p>
                </div> */}
            </div>
        </div>
    </div>
    )
}
