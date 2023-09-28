import React, { useState } from 'react';
import "./CreateNewmeeting.scss";
import { IconCopy, IconLink } from '../../../assets/images';
import toastr from "toastr";
import OutsideClickHandler from 'react-outside-click-handler';
import SDK from "../../SDK";
import { blockOfflineAction, getCallFullLink, getSiteDomain } from '../../../Helpers/Utility';
import Store from '../../../Store';
import { callIntermediateScreen } from '../../../Actions/CallAction';
import { CALL_STATUS_CONNECTED, CALL_STATUS_RECONNECT } from '../../../Helpers/Call/Constant';
import { useSelector } from 'react-redux';
import { showModal } from '../../../Actions/PopUp';
import { toast } from 'react-toastify';

function CreateNewmeeting({meetLinkPopUp, handleShowCallScreen}) {
    const [meetinglink, setmeetinglink] = useState(null);
    const [getPopupShow, setPopupShow] = useState(false);
    const { data: conferenceData = {} } = useSelector((state) => state.showConfrenceData || {});
    const { data: callData = {} } = useSelector((state) => state.callIntermediateScreen || {});

    const handleCopyLink = () => {
        navigator.clipboard.writeText(meetinglink);
        toast.success(`Meeting link copied!`);
    }

    const handlePopup = async() => {
        const response = await SDK.createMeetLink()
        if(response.statusCode == 200){
        const meetLink = getCallFullLink(response.data);
        setmeetinglink(meetLink)
        setPopupShow(!getPopupShow);
        meetLinkPopUp(!getPopupShow)
        }
        else {
            toastr.warning(`Please check your Internet connection`);  
            setPopupShow(!getPopupShow);
            meetLinkPopUp(!getPopupShow);
        } 
    }

    const handleJoinMeet = async () => {
      if (blockOfflineAction()) return "";
      const callLink = meetinglink.split(`${getSiteDomain()}/`)[1];
        if (callData && (conferenceData.callStatusText === CALL_STATUS_CONNECTED ||conferenceData.callStatusText === CALL_STATUS_RECONNECT)) {
          const roomLink = await SDK.getCallLink();
          if (meetinglink.includes(roomLink.data)) {
            handleShowCallScreen();
          } else {
            Store.dispatch(
              showModal({
                open: true,
                modelType: "CallConfirm",
                newCallLink: callLink
              })
            );
          }
        } else {
          Store.dispatch(callIntermediateScreen({ show: true, link: callLink }));
        }
    };

    return (<>
        <div className={`create_new_meeting_wraper ${getPopupShow ? "open" : ""}`}>
            <button onClick={() => handlePopup()} type='button' className='create_new_meeting'>
                <div className='links_icon'>
                    <IconLink />
                </div>
                <div className='create_meeting_info'>
                    <strong>Create a new meeting</strong>
                    <span>Share a link for your Mirrorfly meet</span>
                </div>
            </button>
            {getPopupShow &&
                <OutsideClickHandler onOutsideClick={() => handlePopup()}>
                    <div className='Create_meeting_popup'>
                        <h2>Create a new meeting</h2>
                        <p>Anyone with Mirrorfly can use this link to join this meet. only share it with people you trust.</p>
                        <div className='input_wraper'>
                            <span className='link'>{meetinglink}</span>
                            <button onClick={handleCopyLink} className='copy_btn' type='button'><IconCopy /></button>
                        </div>
                        <div className='border'></div>
                        <button type='button' className='join_new_meeting' onClick={() => handleJoinMeet()}>
                            Join Meeting
                        </button>
                    </div>
                </OutsideClickHandler>
            }
        </div>
    </>
    );
}

export default CreateNewmeeting;
