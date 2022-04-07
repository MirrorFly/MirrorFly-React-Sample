import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { callConversion } from '../../Actions/CallAction';
import Store from '../../Store';
import SDK from '../SDK';
import {
    CALL_CONVERSION_STATUS_ACCEPT, 
    CALL_CONVERSION_STATUS_DECLINE,
    CALL_CONVERSION_STATUS_CANCEL,
    CALL_CONVERSION_STATUS_REQ_WAITING,
    CALL_CONVERSION_STATUS_REQUEST_INIT,
    CALL_CONVERSION_STATUS_REQUEST
} from '../../Helpers/Call/Constant';
import { getFormatPhoneNumber } from '../../Helpers/Utility';
import { getLocalUserDetails, getUserDetails } from '../../Helpers/Chat/User';


// Need to declare as a global variable to maintian call conversion interval state
// Because to avoid the below issue,
// Open confirmation popup which contain SWITCH & CANCEL,
// first click SWITCH & then immediately click CANCEL, then the popup would close & 
// again popup would open with request wating process, at this time click cancel wouldn't
// stop the interval If we declare this interval state varaible as class variable 
let callConverisonInterval = null;

class CallConversionPopup extends Component {

    constructor(props){
        super(props);
        this.fromUserName = null;
        if(props.fromUserJid){
            const fromUser = props.fromUserJid;
            const fromUserDetail = getUserDetails(fromUser);
            this.fromUserName = (fromUserDetail && (fromUserDetail.displayName || fromUserDetail.name)) || getFormatPhoneNumber(fromUser);
        }
    }

    handleAction = async (statusToUpdate) => {

        if(!statusToUpdate){
            Store.dispatch(callConversion());
            return;
        }       

        // If the request initiator status is 'request_waiting', then need to send 'request' status to
        // remote users. That's why below we change the statusToSend value
        // const statusToSend = statusToUpdate === CALL_CONVERSION_STATUS_REQ_WAITING ? 'request' : statusToUpdate;
        // const callConversionRes = await SDK.callConversion(statusToSend);
        let callConversionRes = null;
        if(statusToUpdate === CALL_CONVERSION_STATUS_ACCEPT){
            callConversionRes = await SDK.acceptVideoCallSwitchRequest();
            this.props.resetCallConversionRequestData();
        } else if(statusToUpdate === CALL_CONVERSION_STATUS_REQUEST_INIT){
            callConversionRes = await SDK.requestVideoCallSwitch();    
        } else if(statusToUpdate === CALL_CONVERSION_STATUS_REQ_WAITING){
            callConversionRes = await SDK.requestVideoCallSwitch();    
        }        

        if(callConversionRes && callConversionRes.error){
            Store.dispatch(callConversion({status: CALL_CONVERSION_STATUS_CANCEL}));
            // When user accept the request & If camera access thrown error, then send the decline request.
            if(statusToUpdate === CALL_CONVERSION_STATUS_ACCEPT){
                // await SDK.callConversion(CALL_CONVERSION_STATUS_DECLINE);
                await SDK.declineVideoCallSwitchRequest();
            }
            return;
        }
        Store.dispatch(callConversion({status: statusToUpdate}));

        if(statusToUpdate === CALL_CONVERSION_STATUS_REQ_WAITING){
            let timeLeft = 20;
            clearInterval(callConverisonInterval);
            callConverisonInterval = setInterval(async () => {
                if(timeLeft === 0){
                    clearInterval(callConverisonInterval);
                    Store.dispatch(callConversion({status: CALL_CONVERSION_STATUS_CANCEL}));
                    await SDK.cancelVideoCallSwitchRequest();
                    this.props.resetCallConversionRequestData();
                    toast.error(`No response from ${this.fromUserName}`);
                } else {
                    timeLeft = timeLeft - 1;
                }
            }, 1000)
        }

        if(statusToUpdate === CALL_CONVERSION_STATUS_DECLINE){
            clearInterval(callConverisonInterval);
            await SDK.declineVideoCallSwitchRequest();
        }

        if(statusToUpdate === CALL_CONVERSION_STATUS_CANCEL){
            clearInterval(callConverisonInterval);
            this.props.resetCallConversionRequestData();
            await SDK.cancelVideoCallSwitchRequest();
        }
    }

    componentDidUpdate(prevProps){
        const { callConversionData: prevCallConversionData } = prevProps;
        const { callConversionData } = this.props;
        if(prevCallConversionData && 
            callConversionData && 
            prevCallConversionData.status !== callConversionData.status && 
            [
                CALL_CONVERSION_STATUS_DECLINE, 
                CALL_CONVERSION_STATUS_CANCEL, 
                CALL_CONVERSION_STATUS_ACCEPT
            ].indexOf(callConversionData.status) > -1
        ){
            if(prevCallConversionData.status === CALL_CONVERSION_STATUS_REQ_WAITING &&
            callConversionData.status === CALL_CONVERSION_STATUS_DECLINE){
                toast.error("Request declined");
                this.props.resetCallConversionRequestData();
            }
            clearInterval(callConverisonInterval);            
            Store.dispatch(callConversion());
        }
    }

    componentWillUnmount(){
        clearInterval(callConverisonInterval);
    }

    render() {
        const { callConversionData: { status } } = this.props;

        if(!status) return null;

        let content = null;
        let cancelBtnLabel = null;
        let confirmBtnLabel = null;
        let cancelStatusToUpdate = null;
        let confirmStatusToUpdate = null;
        if(status === CALL_CONVERSION_STATUS_REQUEST_INIT){ // Request initiator
            content = 'Are you sure you want to switch to Video call?';
            cancelBtnLabel = 'CANCEL';
            confirmBtnLabel = 'SWITCH';
            confirmStatusToUpdate = CALL_CONVERSION_STATUS_REQ_WAITING;
        }
        else if(status === CALL_CONVERSION_STATUS_REQ_WAITING){ // Request initiator
            content = 'Requesting to switch to video call.';
            cancelBtnLabel = 'CANCEL';
            cancelStatusToUpdate = CALL_CONVERSION_STATUS_CANCEL;
            if(this.props.remoteUserRequestingCallSwitch){
                this.handleAction(CALL_CONVERSION_STATUS_ACCEPT);
            }
        }
        else if(status === CALL_CONVERSION_STATUS_REQUEST){ // Request receiver
            content = `${this.fromUserName} Requesting to switch to video call`;
            cancelBtnLabel = 'DECLINE';
            cancelStatusToUpdate = CALL_CONVERSION_STATUS_DECLINE;
            confirmBtnLabel = 'ACCEPT';
            confirmStatusToUpdate = CALL_CONVERSION_STATUS_ACCEPT;
            if(this.props.currentUserRequestingCallSwitch){
                this.handleAction(CALL_CONVERSION_STATUS_ACCEPT);
            }
        } else if(status === CALL_CONVERSION_STATUS_ACCEPT){
            this.props.resetCallConversionRequestData();
        }

        if(!content) return null;

        return (
            <div className="popup-wrapper call-conversion-popup">
                <div className={`popup-container`}>
                    <div className="popup-container-inner">
                        <div className="popup-label">
                            <label>{content}</label>
                        </div>
                        <div className="popup-noteinfo">
                            {cancelBtnLabel && <button type="button" onClick={() => this.handleAction(cancelStatusToUpdate)} className="btn-cancel" >{cancelBtnLabel}</button>}
                            {confirmBtnLabel && <button type="button" onClick={() => this.handleAction(confirmStatusToUpdate)} className="btn-active">{confirmBtnLabel}</button>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    const data = state?.showConfrenceData?.data || {};
    const { remoteStream } = data;
    const vcardData = getLocalUserDetails();
    let fromUserJid = "";
    if (remoteStream && remoteStream.length > 0) {
        remoteStream.map((rs) => {
            let id = rs.fromJid;
            id = id.includes("@") ? id.split("@")[0] : id;
            if(id !== vcardData.fromUser){
                fromUserJid = rs.fromJid
            }
        });                
    }
    return {
        fromUserJid: fromUserJid,
        rosterData: state.rosterData
    }
}


export default connect(mapStateToProps, null)(CallConversionPopup);
