import React from "react";
import { SettingsHeader } from "../Settings";
import "./About.scss";

const PrivacyPolicy = (props) => {
  const { backToAbout } = props;
  return (
    <div className="setting-container">
      <div>
        <div className="settinglist">
          <SettingsHeader
          handleBackFromSetting={backToAbout} 
          label={"Terms and Privacy Policy"} />
          <div className="setting-list-ul Details">
            <div className="content-block">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
