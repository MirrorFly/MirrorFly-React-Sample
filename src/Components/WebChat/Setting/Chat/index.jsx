import React, { useEffect, useState } from "react";
import { SettingCheckBox, SettingsHeder } from "../Settings";
import "./../Setting.scss";
import "./Chat.scss";
import { DropdownArrow } from "../../../../assets/images";
import { InfoIcon } from "../images";
import { blockOfflineAction, getLocalWebsettings, isAppOnline, setLocalWebsettings } from "../../../../Helpers/Utility";
import Store from "../../../../Store";
import { webSettingLocalAction } from "../../../../Actions/BrowserAction";
import { useSelector } from "react-redux";
import OutsideClickHandler from "react-outside-click-handler";
import BoxedLayout from './BoxedLayout';
import config from "../../../../config";

const Chat = (props = {}) => {

  const globalStoteData = useSelector((state) => state || {})
  const { TranslateLanguage: { translateLanguages: { translateLanguages = [] } }, webLocalStorageSetting : {isEnableArchived} = {} } = globalStoteData;
  const { handleBackToSetting , setSelectedLaun = "English" } = props;
  const [enableTranslate, setEnableTranslate] = useState(false);
  const [language, setLaunguage] = useState(setSelectedLaun)
  const [showDrop, setshowDrop] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [boxedLayout, setBoxedLayout] = useState(false);

  useEffect(() => {
    const webSettings = getLocalWebsettings();
    if (webSettings && Object.keys(webSettings).length) {
      setEnableTranslate(webSettings.translate || false);
      setTranslate(webSettings.translate || false );
      setBoxedLayout(webSettings.boxLayout || false );
      Store.dispatch(webSettingLocalAction({
        "translate": webSettings.translate || false,
        "isEnableArchived": webSettings.archive
      }));
    }
  }, []);

  useEffect(() => {
    setLaunguage(setSelectedLaun);
  }, [setSelectedLaun]);

  useEffect(() => {
    setLocalWebsettings("translate", translate);
    setEnableTranslate(translate);
  }, [translate]);
  
  const handleTranslationState = (value) => {
    if (blockOfflineAction()) return;
    setTranslate(value);
    Store.dispatch(webSettingLocalAction({
      "translate":value,
      "isEnableArchived": isEnableArchived
    }));
    setLocalWebsettings("translate", value);
    setEnableTranslate(value);
  };

  const handleLanguage = (value) => {
    setLocalWebsettings("translateLang", value.language);
    setLaunguage(value.name);
    setshowDrop(false);
  };
  const outsidePopupClick = () => {
    setshowDrop(false);
  }

  const handleDrop = (event={}) => {
    if (blockOfflineAction()) return;
    setshowDrop(true);
  };
  
  const searchLanguage = (e = {}) => {
    const value = e?.target?.value;
    setLaunguage(value);
    const search = value.toLowerCase();
    const translateLanguage = document.querySelectorAll("li.language");
    for (const i of translateLanguage) {
        const item = i.innerHTML.toLowerCase();
        if (item.indexOf(search) === -1) {
            i.style.display = "none";
        } else {
            i.style.display = "block";
        }
    }
};

  return (
    <div className="setting-container">
      <div>
        <div className="settinglist">
          <SettingsHeder handleBackFromSetting={handleBackToSetting} label={"Chat"} />
          <ul className="setting-list-ul chat-setting">
            {config.boxLayout && <BoxedLayout
              dafaultValue={boxedLayout}
              id={"boxedLayout"}
              label={"Boxed View"}
              />}
            <SettingCheckBox
              getaAtion={handleTranslationState}
              chat={true}
              dafaultSetting={translate}
              id={"chat-setting"}
              label={"Translate Message"}
            >
              <span className="label-info">Enable Translate Message to choose Translation Language</span>
              {enableTranslate && (
                <div className="language-select">
                  <h4>Choose Translation Language</h4>
                  <div 
                    onClick={(e)=>handleDrop(e)}
                    className={showDrop ? "defaultSelected active" : "defaultSelected"}
                  >
                    <input
                      placeholder="Select any language"
                      readOnly={!isAppOnline() ? true : false}
                      onChange={(e) => !blockOfflineAction() ? searchLanguage(e) : null}
                      value={language}
                    />
                    <DropdownArrow />
                  </div>
                  <OutsideClickHandler  onOutsideClick={() => outsidePopupClick()}>
                  <div className="drop-wrapper">
                    {showDrop && (
                      <div>
                        <ul className="drop-option">
                          {translateLanguages.map((lang, i) => (
                            <li className="language" key={i}>
                              <button onClick={() => handleLanguage(lang)}>{lang.name}</button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  </OutsideClickHandler>
                  <p className="info">
                    <i>
                      <InfoIcon />
                    </i>
                    <span>
                    Mouse over received message chat bubble which displays Translate Message icon,{" "}
                      <strong>"Click it to translate the message"</strong>
                    </span>
                  </p>
                </div>
              )}
            </SettingCheckBox>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Chat;
