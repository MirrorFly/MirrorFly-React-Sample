import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { popupStatus } from "../../../../../Actions/PopUp";
import { SelectedForward, SelectedClose, Delete, StarredDark, UnStarDark } from "../../../../../assets/images";
import Store from "../../../../../Store";
import Modal from "../../../Common/Modal";
import ForwardPopUp from "../../../PopUp/Forward";

export default function ForwardOptions(props = {}) {
  const { msgActionType, closeMessageOption, activeJid, deleteMultipleMessages, handleStarredAction, chatMessages } = props;
  const {
    selectedMessageData: { id = "", totalMessage = 0, data = [] } = {}
  } = useSelector((state) => state);

  const [popUpStatus, setPopUpStatus] = useState(false);
  const showForwardPopUp = () => {
    setPopUpStatus(!popUpStatus);
    Store.dispatch(popupStatus(!popUpStatus));
  };

  useEffect(() => {
    if (id && totalMessage === 0) {
      closeMessageOption();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      closeMessageOption();
    };
  }, []);

  const getStarredActionStatus = () => {
    let isFavourite = false;
    data.map((el) => {
      if (el.favouriteStatus === 0) isFavourite = true;
      return el.msgId;
    });
    return isFavourite;
  };

  return (
    <Fragment>
      <div className="selectedMessagecontainer">
        <div className="selectedMessageOption">
          <div className="CloseSelectedMessageOption">
            <i onClick={closeMessageOption} title="Close">
              <SelectedClose />
            </i>
            <span>{totalMessage} Selected</span>
          </div>
          <ul className="selectedForwardOption">
            {msgActionType === "Delete" && (
              <li onClick={deleteMultipleMessages} className="delete" title="Delete">
                <i>
                  <Delete />
                </i>
              </li>
            )}
            {msgActionType === "Forward" && (
              <li className="forward" data-jest-id="jestShowForwardPopUp" onClick={showForwardPopUp} title="Forward">
                <i>
                  <SelectedForward />
                </i>
              </li>
            )}

            {(msgActionType === "Starred" || msgActionType === "UnStarred") && (
              <>
                {getStarredActionStatus() ? (
                  <li className="star" title="Add as favourite" onClick={handleStarredAction}>
                    <i>
                      <StarredDark fill="#383636" />
                    </i>
                  </li>
                ) : (
                  <li className="star" title="Remove from favourite" onClick={handleStarredAction}>
                    <i>
                      <UnStarDark fill="#383636" />
                    </i>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
      {popUpStatus && (
        <Modal containerId="container">
          <ForwardPopUp
           activeJid={activeJid} 
           closeMessageOption={closeMessageOption} 
           closePopup={showForwardPopUp} 
           chatMessages={chatMessages}
          />
        </Modal>
      )}
    </Fragment>
  );
}
