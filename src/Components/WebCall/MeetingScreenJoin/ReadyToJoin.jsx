import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { NewLogoVector } from "../../../assets/images";
import { getMaxUsersInCall } from "../../../Helpers/Call/Call";
import ImageComponent from "../../WebChat/Common/ImageComponent";

const MAX_PROFILE_LIMIT = 3;

const ReadyToJoin = ({ participantsData = [], displayName = "", handleTryAgain, handleCancel, handleJoinCall }) => {
  const { isOnline = true } = useSelector((state) => state.appOnlineStatus);

  useEffect(() => {
    if (isOnline && participantsData?.length === 0) {
      handleTryAgain();
    }
  }, [participantsData]);

  return (
    <div className="m_participant_wrapper">
      <div className="m_participant_details">
        <div className="brand_logo">
          <img src={NewLogoVector} alt={NewLogoVector} />
        </div>
        <h2>Ready to join ?</h2>
        <div className="meeting_participant_list">
          {participantsData?.map(
            (el, i) =>
              i < MAX_PROFILE_LIMIT && (
                <div className="calleeProfiles" key={i}>
                  <ImageComponent chatType={"chat"} imageToken={el.image} name={el.initialName} />
                </div>
              )
          )}
          {participantsData?.length > MAX_PROFILE_LIMIT && (
            <div className="participant-count">
              <span className="moreText">+{participantsData?.length - MAX_PROFILE_LIMIT}</span>
            </div>
          )}
        </div>
        <p className="participant-names">{displayName}</p>
        {participantsData?.length == getMaxUsersInCall() ? (
          <>
            <div className="action-btns">
              <button type="button" onClick={handleTryAgain} className="Meeting_join">
                Try Again
              </button>
              <button type="button" onClick={handleCancel} className="Meeting_join cancel">
                Cancel
              </button>
            </div>
            <p className="internet show">Maximum {getMaxUsersInCall()} members allowed in call</p>
          </>
        ) : (
          <button type="button" onClick={handleJoinCall} className="Meeting_join">
            Join Now
          </button>
        )}
        {!isOnline && <p className="internet show">Please check your internet connection</p>}
      </div>
    </div>
  );
};

export default ReadyToJoin;
