import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  AudioOff,
  AudioOn,
  VideoOff,
  VideoOn,
  BackToChatWhite,
  ImgLoaderWhite,
  ImgBgCallEnd
} from "../../../assets/images";
import ReadyToJoin from "./ReadyToJoin";
import CallLinkStatus from "./CallLinkStatus";
import SDK from "../../SDK";
import { getLocalUserDetails } from "../../../Helpers/Chat/User";
import { CALL_STATUS_CONNECTED } from "../../../Helpers/Call/Constant";
import Video from "../Video";
import { muteLocalAudio, muteLocalVideo, resetCallData } from "../../callbacks";
import { callIntermediateScreen, isMuteAudioAction, showConfrence } from "../../../Actions/CallAction";
import Store from "../../../Store";
import { getCallDisplayDetailsForOnetoManyCall } from "../../../Helpers/Call/Call";
import { showModal } from "../../../Actions/PopUp";
import { toast } from "react-toastify";

const MeetingScreenJoin = (props = {}) => {
  const [audioMute, setAudioMute] = useState(false);
  const [videoMute, setVideoMute] = useState(false);
  const [activeScreen, setActiveScreen] = useState({
    loading: true,
    readyToJoin: false,
    callEnd: false,
    invalidLink: false
  });
  const [userCallDetails, setUserCallDetails] = useState({});
  const { data: conferenceData = {} } = useSelector((state) => state.showConfrenceData);
  const { isOnline = true } = useSelector((state) => state.appOnlineStatus);
  const { data: callData = {} } = useSelector((state) => state.callIntermediateScreen);

  useEffect(() => {
    if (callData.usersList?.length) {
      let updateArr = getCallDisplayDetailsForOnetoManyCall(callData.usersList || [], "subscribe");
      setUserCallDetails(updateArr);
    } else if (callData.usersList?.length === 0 && activeScreen.readyToJoin) {
      SDK.unsubscribeCall();
      setActiveScreen({
        ...activeScreen,
        loading: false,
        readyToJoin: false,
        callEnd: true
      });
    }
  }, [callData.usersList]);

  const subscribeToCall = async () => {
    const roomLink = props.callData?.link;
    let vcardData = getLocalUserDetails();
    const updateObj = {
      ...activeScreen,
      loading: false
    };

    if (roomLink && vcardData.nickName) {
      SDK.subscribeCall(roomLink, vcardData.nickName, (response, error) => {
        console.log("subscribeCall :>> ", response, error);
        if (error) {
          if (error.statusCode === 100601) {
            updateObj.invalidLink = true;
          } else if (error.statusCode === 100602) {
            updateObj.callEnd = true;
          } else if (error.statusCode === 100603) {
            updateObj.readyToJoin = true;
          }
        } else {
          if (response.statusCode === 100500) {
            updateObj.readyToJoin = true;
          }
        }
        setActiveScreen(updateObj);
      });
    } else {
      setActiveScreen(updateObj);
    }
  };

  useEffect(() => {
    subscribeToCall();
  }, []);

  useEffect(() => {
    const { callStatusText = "", status = "" } = conferenceData || {};
    if (activeScreen.loading && callStatusText === CALL_STATUS_CONNECTED && status === "LOCALSTREAM") {
      Store.dispatch(callIntermediateScreen({ show: false }));
    }
  }, [conferenceData]);

  useEffect(() => {
    if (Object.keys(conferenceData).length && conferenceData.localVideoMuted !== videoMute) {
      setVideoMute(conferenceData.localVideoMuted);
    }
  }, [conferenceData.localVideoMuted]);

  const handleAudioMute = async () => {
    const audioMuteResult = await SDK.muteAudio(!audioMute);
    console.log("Intermediate audioMuteResult :>> ", audioMuteResult?.statusCode);
    if (audioMuteResult?.statusCode === 200) {
      muteLocalAudio(!audioMute);
      setAudioMute(!audioMute);
      Store.dispatch(isMuteAudioAction(!audioMute));
      Store.dispatch(
        showConfrence({
          ...conferenceData,
          localAudioMuted: !audioMute
        })
      );
    } else if (audioMuteResult?.statusCode === 500) {
      Store.dispatch(
        showModal({
          open: true,
          modelType: "mediaPermissionDenied",
          statusCode: 100606
        })
      );
    }
  };

  const handleVideoMute = async () => {
    const videoMuteResult = await SDK.muteVideo(!videoMute);
    console.log("Intermediate videoMuteResult :>> ", videoMuteResult?.statusCode);
    if (videoMuteResult?.statusCode === 200) {
      muteLocalVideo(!videoMute);
      setVideoMute(!videoMute);
      Store.dispatch(
        showConfrence({
          ...conferenceData,
          localVideoMuted: !videoMute
        })
      );
    } else if (videoMuteResult?.statusCode === 500) {
      Store.dispatch(
        showModal({
          open: true,
          modelType: "mediaPermissionDenied",
          statusCode: 100607
        })
      );
      Store.dispatch(showConfrence({ ...conferenceData, videoPermissionDisabled: true }));
    }
  };

  const handleTryAgain = () => {
    subscribeToCall();
  };

  const handleBackButton = () => {
    SDK.unsubscribeCall();
    resetCallData();
    setActiveScreen({
      ...activeScreen,
      loading: false
    });
    Store.dispatch(callIntermediateScreen({ show: false, toggleCallScreen: false }));
  };

  const handleJoinCall = async () => {
    if (isOnline) {
      setActiveScreen({
        ...activeScreen,
        loading: true
      });
      SDK.joinCall((response, error) => {
        console.log("joinCall result :>> ", response, error);
        if (error) {
          if (error.statusCode === 100602) {
            setActiveScreen({
              ...activeScreen,
              loading: false,
              readyToJoin: false,
              callEnd: true
            });
          } else {
            toast.error("The server is not responding. Please try again later");
            setActiveScreen({
              ...activeScreen,
              loading: false
            });
          }
        }
      });
    }
  };

  const { loading, readyToJoin, callEnd, invalidLink } = activeScreen;

  return (
    <div className="join_meeting_wrapper">
      <div className="optionButton">
        <span title="Back to chat" className="BackToChat" onClick={handleBackButton}>
          <i className="backIcon">
            <span className="toggleAnimation"></span>
            <BackToChatWhite />
          </i>
        </span>
      </div>
      <div
        className="meeting_video_container"
        style={{ background: callEnd || invalidLink ? `url(${ImgBgCallEnd}) no-repeat left center` : "#fff" }}
      >
        {loading && (
          <div className="page-loader">
            <img src={ImgLoaderWhite} alt="message-history" />
          </div>
        )}

        {readyToJoin && (
          <>
            <div className="m_video_container_wrapper">
              <div className="m_video_container">
                <div className="video_container">
                    <div className="alert-badge">
                      {conferenceData?.localAudioMuted && (
                        <div className={`badge-list ${conferenceData?.localVideoMuted ? "" : "videoOn"}`}>
                          <AudioOff /> <span>Microphone off</span>
                        </div>
                      )}
                    </div>
                  {conferenceData?.localVideoMuted ? (
                    <div className="CameraOffAlert"><span>Camera off</span></div>
                  ) : (
                    <Video
                      stream={conferenceData?.localStream?.video}
                      muted={conferenceData?.localVideoMuted}
                      id={conferenceData?.localStream?.video?.id}
                      inverse={true}
                    />
                   
                  )}
                  <div className="m_call_action">
                    <button
                      onClick={handleAudioMute}
                      className={audioMute ? "audioBtnAction mute" : "audioBtnAction "}
                      type="button"
                    >
                      <i className={audioMute ? "audioBtn mute" : "audioBtn "}>
                        {audioMute ? <AudioOff /> : <AudioOn />}
                      </i>
                    </button>
                    <button onClick={handleVideoMute} className={videoMute ? "videoBtnAction mute" : "videoBtnAction "} type="button">
                      <i className={videoMute ? "videoBtn mute" : "videoBtn "}>
                        {videoMute ? <VideoOff /> : <VideoOn />}
                      </i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ReadyToJoin
              displayName={userCallDetails?.displayName}
              participantsData={userCallDetails?.participantsData}
              handleTryAgain={handleTryAgain}
              handleCancel={handleBackButton}
              handleJoinCall={handleJoinCall}
            />
          </>
        )}
        {(callEnd || invalidLink) && <CallLinkStatus handleBack={handleBackButton} callEndScreen={callEnd} />}
      </div>
    </div>
  );
};

export default MeetingScreenJoin;
