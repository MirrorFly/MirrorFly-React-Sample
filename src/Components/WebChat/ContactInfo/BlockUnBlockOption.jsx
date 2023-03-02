import React from "react";
import { useSelector } from "react-redux";

import {
  ClearChat, Delete, UnBlock, Blocked, BlockedInfo,
  IconSingleReport
} from "../../../assets/images";
import { getArchiveSetting } from "../../../Helpers/Utility";
import ChatMuteOption from "./ChatMuteOption";

const BlockUnBlockOption = (props = {}) => {
  const { isBlocked, ClearPopupAction, popUpToggleAction, deletePopupAction, handleChatMuteAction,
    reportSingleChatAction = () => { }, featureStateData = {} } = props;
    const {
      isClearChatEnabled = true,
      isDeleteChatEnabled = true,
      isBlockEnabled = true,
      isReportEnabled = true
    } = featureStateData;
  const isPermanentArchvie = getArchiveSetting();
  const { data: { chatId = "", recent: { muteStatus = 0, archiveStatus = 0 } = {} } = {} } =
    useSelector((store) => store.activeChatData) || {};
  return (
    <div className="contactinfo-about-no">
      {(archiveStatus !== 1 || !isPermanentArchvie) ? (
        <ChatMuteOption chatId={chatId} handleChatMuteAction={handleChatMuteAction} isChatMute={muteStatus === 1} />
      )
        :
        <div className="text-disbaled"><BlockedInfo /> <span>Archived chats are muted</span></div>
      }

      {isBlockEnabled && isBlocked && (
        <div data-jest-id={"jestpopUpToggleAction"} className="about-no" onClick={popUpToggleAction}>
          <i className="UnBlockIcon">
            <UnBlock />
          </i>
          <span className="btn-block unblock">{"Unblock Contact"}</span>
        </div>
      )}

      {isBlockEnabled && !isBlocked && (
        <div data-jest-id={"jestpopUpToggleAction"} className="about-no" onClick={popUpToggleAction}>
          <i className="BlockedIcon">
            <Blocked />
          </i>
          <span className="btn-block">{"Block Contact"}</span>
        </div>
      )}

      {isClearChatEnabled &&
        <div className="about-no" data-jest-id={"jestClearPopupAction"} onClick={ClearPopupAction}>
          <i className="deleteIcon">
            <ClearChat />
          </i>
          <span className="delete">{"Clear Chat"}</span>
        </div>
      }

      {isDeleteChatEnabled &&
        <div data-jest-id={"jestdeletePopupAction"} className="about-no" onClick={deletePopupAction}>
          <i className="deleteIcon">
            <Delete />
          </i>
          <span className="delete">{"Delete Chat"}</span>
        </div>
      }

      {isReportEnabled &&
        <div data-jest-id={"jestSingleReportAction"} className="about-no" onClick={reportSingleChatAction}>
          <i className="reportIcon">
            <IconSingleReport />
          </i>
          <span className="report">{"Report"}</span>
        </div>
      }
    </div>
  );
};


export default BlockUnBlockOption;
