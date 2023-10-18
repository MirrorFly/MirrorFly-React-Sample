import React, { useEffect, useState } from "react";
import { IconCopy, IconCalendarTime, SelectedClose } from '../../../assets/images';
import "../../Layouts/CreateNewmeeting/CreateNewmeeting.scss";
import DatePicker from "react-datepicker";
import "../../../assets/scss/datepicker.scss";
import Store from "../../../Store";
import { showModal } from "../../../Actions/PopUp";
import SDK from "../../SDK";
import { blockOfflineAction, getCallFullLink, getSiteDomain } from "../../../Helpers/Utility";
import toastr from "toastr";
import { toast } from 'react-toastify';
import { CALL_STATUS_CONNECTED, CALL_STATUS_RECONNECT } from "../../../Helpers/Call/Constant";
import { useSelector } from "react-redux";
import { callIntermediateScreen } from "../../../Actions/CallAction";
import { getLocalUserDetails } from "../../../Helpers/Chat/User";


 function CallScheduling(props) {

  const [instantMeeting, setInstantMeeting] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateTimeSelection, setDateTimeSelection] = useState(false);
  const [scheduleDate, setscheduleDate] = useState(new Date());
  const [scheduleMeetLink, setScheduleMeetLink] = useState("Loading...")
  const { data: conferenceData = {} } = useSelector((state) => state.showConfrenceData || {});
  const { data: callData = {} } = useSelector((state) => state.callIntermediateScreen || {});
  const { data: groupsMemberListData = {} } = useSelector((state) => state.groupsMemberListData || {});
  const { data: activeChatData = {} } = useSelector((state) => state.activeChatData || {});

  useEffect(() => {
    handleScheduleMeetLink()
  }, [])

  useEffect(() => {
    const vcardData = getLocalUserDetails();
    const chatType = activeChatData.chatType;
    const userIngroup = groupsMemberListData?.participants?.find((profile) => {
      return vcardData.fromUser === profile.userId
    });
    if (chatType === "groupchat" && groupsMemberListData?.groupJid === activeChatData.chatJid && !userIngroup) {
      handleCloseSchedulePopup();
    }
  }, [groupsMemberListData])

  const handleScheduleMeetLink = async() =>{
    const response = await SDK.createMeetLink();
    if(response.statusCode == 200){
    const meetLink = getCallFullLink(response.data);
    setScheduleMeetLink(meetLink)
    }
    else {
      toastr.warning(`Something went wrong`);  
    } 
  }
  
  const handleCopyLink = () => {
    if(scheduleMeetLink != "Loading..."){
      navigator.clipboard.writeText(scheduleMeetLink);
      toast.success(`Meeting link copied!`);
    } 
  }

  const handleShowCalendar = async() => {
      setInstantMeeting(!instantMeeting);
      setDateTimeSelection(!dateTimeSelection);
      setscheduleDate(new Date());
  }

  const handleCloseSchedulePopup = () => {
      Store.dispatch(
        showModal({
            open: false,
            modelType: "scheduleMeeting"
        })
    );
  }

   const ScheduledDateValidation = (date) => {
     const selectedDate = new Date(date);
     const currentDate = new Date();
     selectedDate.setSeconds(0, 0);
     currentDate.setSeconds(0, 0);
     return selectedDate >= currentDate
   }


  const handleJoinMeet = async () => {
    if (blockOfflineAction() || scheduleMeetLink === "Loading...") return "";
    const callLink = scheduleMeetLink.split(`${getSiteDomain()}/`)[1];
      if (callData && (conferenceData.callStatusText === CALL_STATUS_CONNECTED ||conferenceData.callStatusText === CALL_STATUS_RECONNECT)) {
        const roomLink = await SDK.getCallLink();
        if (scheduleMeetLink.includes(roomLink.data)) {
          handleCloseSchedulePopup();
          props.handleShowCallScreen();
        } else {
          handleCloseSchedulePopup();
          Store.dispatch(
            showModal({
              open: true,
              modelType: "CallConfirm",
              newCallLink: callLink
            })
          );
        }
      } else {
        handleCloseSchedulePopup();
        Store.dispatch(callIntermediateScreen({ show: true, link: callLink }));
      }
  };

  const handleMeetMsgeSend = async () => {
    // We need to pass a scheduleMeetData via props and handling inside of WebChatConversationHistory component like
    // CallScheduling -> Sidebar -> Login -> ConversationSection -> WebChatConversationHistory
 
      if (ScheduledDateValidation(scheduleDate)) {
        const dateObject = new Date(scheduleDate);
        const scheduledDateTime = dateObject.getTime();
        props.handleMeetMsgeSend({ scheduledDateTime, scheduleMeetLink });
        handleCloseSchedulePopup();
      } else {
        toastr.warning(`Please check your selected date and time`);
      }
   
  };
  

  return (
    <>
        <div className="popup-wrapper">
          <div className="popup-container add-participant audio">
            <div className='create_new_meeting_wraper'>
              <div className="popup-container-inner">
                  <div className='Create_meeting_popup instantCallScheduling'>
                    <span className="close_popup" onClick={handleCloseSchedulePopup}><SelectedClose /></span>
                    {instantMeeting &&
                      <div className='instant-meeting'>
                        <h2>Instant Meet</h2>
                        <p>Copy the link or click to join the meeting</p>
                        <div className='input_wraper'>
                          <span className='link'>{scheduleMeetLink}</span>
                          {scheduleMeetLink != "Loading..." && (
                          <button className='copy_btn' type='button' onClick={handleCopyLink}><IconCopy /></button>
                          )}
                      </div> 
                        <button type='button' className={(scheduleMeetLink != "Loading...") ? 'join_new_meeting' : 'join_new_meeting join_btn_disabel'} onClick={() => handleJoinMeet()}>
                          Join Meeting
                        </button>
                        <div className='border'></div>
                      </div>
                    }
                    <div className='schedule-meeting'>
                      <h4>Schedule Meeting </h4>
                        <div className="calendarOption">
                        <label className="calender-switch">
                          <input type="checkbox" disabled={(scheduleMeetLink != "Loading...") ? false : true} onChange={handleShowCalendar} />
                          <span className="slider round"></span>
                        </label>
                        </div>
                    </div>
                    {dateTimeSelection &&
                      <div className="calendar-time-selection-section">
                        <div className="calendar-time">
                        <DatePicker
                            selected={scheduleDate}
                            onChange={(date) => setscheduleDate(date)}
                            minDate={new Date()}
                            timeInputLabel="Time:"
                            dateFormat="dd/MM/yyyy h:mm aa"
                            showTimeInput
                            onInputClick={()=> setShowCalendar(!showCalendar)}
                            onClickOutside={() => setShowCalendar(false)}
                            open={showCalendar}
                            readOnly={true}
                        />
                          <i className="date-and-time" onClick={()=> setShowCalendar(!showCalendar)}><IconCalendarTime /></i>
                        </div>
                        <button type='button' className='join_new_meeting' onClick={handleMeetMsgeSend}> Schedule Meeting </button>
                      </div>

                    }

                  </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}

export default CallScheduling;
