import React from "react";
import { SettingsHeader } from "../Settings";
import "./About.scss";

const AboutDetails = (props) => {
  const { backToAbout } = props;
  return (
    <div className="setting-container">
      <div>
        <div className="settinglist">
          <SettingsHeader handleBackFromSetting={backToAbout} label={"About Us"} />
          <div className="setting-list-ul Details">
            <div className="content-block">
              <p className="content">
                MirrorFly is a ready-to-go messaging solution for building enterprise-grade real-time chat IM
                applications that meet various degrees of requirements like team discussion, data sharing, task
                delegation and information handling on the go.
              </p>
            </div>
            <div className="content-block">
              <h3 className="subheading">Contact Us</h3>
              <p className="content">To have a detailed interaction with our experts</p>
            </div>
            <div className="content-block">
              <h3 className="subheading">FAQ</h3>
              <p className="content">
                Kindly checkout FAQ section for doubts regarding MirrorFly. We might have already answered your
                question.
              </p>
              <div>
                <a className=" content content-link" target="_blank" href="https://www.mirrorfly.com/" rel="noopener noreferrer">
                  MirrorFly
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDetails;
