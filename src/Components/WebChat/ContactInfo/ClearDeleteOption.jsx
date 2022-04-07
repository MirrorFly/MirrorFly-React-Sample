import React, { Fragment } from "react";
import Participants from "./Participants";
import { AddParticiapants, BlockedInfo, ClearChat, Delete, IconExitGroup } from "../../../assets/images";
import ChatMuteOption from "./ChatMuteOption";
import { useSelector } from "react-redux";
import { getArchiveSetting } from "../../../Helpers/Utility";

const ClearDeleteOption = (props = {}) => {
  const {
    isAdmin,
    exitGroup,
    vCardData,
    groupuniqueId,
    participants = [],
    ClearPopupAction,
    deletePopupAction,
    dispatchExitAction,
    handleChatMuteAction,
    handleNewParticipants
  } = props;

  const isPermanentArchvie = getArchiveSetting();
  const { data: { chatId = "", recent: { muteStatus = 0, archiveStatus = 0 } = {} } = {} } =
    useSelector((store) => store.activeChatData) || {};

  return (
    <Fragment>
      <div className="contactinfo-about-no action">
        {(archiveStatus !== 1 || !isPermanentArchvie) ? (
          <ChatMuteOption chatId={chatId} handleChatMuteAction={handleChatMuteAction} isChatMute={muteStatus === 1} />
        )
        :
        <div className="text-disbaled"><BlockedInfo /> <span>Archived chats are muted</span></div>
      }
      </div>
      <div className="contactinfo-media group-members">
        <h5>
          <span className="media">Participants</span>
          <span className="count">{participants.length}</span>
        </h5>
        <ul>
          {isAdmin && (
            <li className="addMembers" onClick={handleNewParticipants} data-jest-id={"jesthandleNewParticipants"}>
              <div className="user-profile-name">
                <div className="profile-image">
                  <AddParticiapants />
                </div>
                <div className="profile-name">
                  <span>
                    <h3>Add Participants</h3>
                  </span>
                </div>
              </div>
            </li>
          )}
          {participants &&
            participants.map((members, index) => {
              return (
                <Participants
                  key={index}
                  members={members}
                  isAdmin={isAdmin}
                  groupuniqueId={groupuniqueId}
                  vCardData={vCardData}
                />
              );
            })}
        </ul>
        <div className="contactinfo-about-no action">
          <div className="about-no" onClick={ClearPopupAction} data-jest-id={"jestClearPopupAction"}>
            <i className="deleteIcon">
              <ClearChat />
            </i>
            <span className="delete">{"Clear Chat"}</span>
          </div>
          {!exitGroup ? (
            <div className="about-no grp-exit" onClick={dispatchExitAction} data-jest-id={"jestdispatchExitAction"}>
              <i>
                <IconExitGroup />
              </i>
              <span className="delete">Exit Group</span>
            </div>
          ) : (
            <div className="about-no" data-jest-id={"jestdeletePopupAction"} onClick={deletePopupAction}>
              <i className="deleteIcon">
                <Delete />
              </i>
              <span className="delete">{"Delete Group"}</span>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default ClearDeleteOption;
