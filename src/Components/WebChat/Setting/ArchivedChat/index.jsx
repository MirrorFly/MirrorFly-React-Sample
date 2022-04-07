import React, { useEffect, useState } from "react";
import { SettingCheckBox, SettingsHeder } from "../Settings";
import "./../Setting.scss";
import "./Archive.scss";
import { setLocalWebsettings } from "../../../../Helpers/Utility";
import Store from "../../../../Store";
import { webSettingLocalAction } from "../../../../Actions/BrowserAction";
import SDK from "../../../SDK";
import { useSelector } from "react-redux";

const ArchivedChat = (props = {}) => {
  const { isEnableArchived = true } = useSelector(state => state.webLocalStorageSetting)
  const [archive, setArchive] = useState(isEnableArchived);
  const { handleBackToSetting } = props;
  const handleTranslationState = (value) => {
    setArchive(value);
    SDK.updateUserSettings(value);
    setLocalWebsettings("archive", value);
    Store.dispatch(webSettingLocalAction({
      "isEnableArchived": value
    }));
  };
  useEffect(() => {
    setArchive(isEnableArchived)
  }, [isEnableArchived])
  return (
    <div className="setting-container">
      <div>
        <div className="settinglist">
          <SettingsHeder handleBackFromSetting={handleBackToSetting} label={"Archive settings"} />
          <ul className="setting-list-ul chat-setting">
            <SettingCheckBox
              getaAtion={handleTranslationState}
              chat={true}
              dafaultSetting={archive}
              id={"chat-setting"}
              label={"Keep chats archived"}
            >
              <span className="label-info">Archived chats will remain archived when you receive a new message</span>
            </SettingCheckBox>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default ArchivedChat;
