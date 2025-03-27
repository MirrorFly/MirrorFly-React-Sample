import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowBack } from '../../../assets/images';
import { BlockedIcon, chat as ChatIcon, InfoIcon, InformationIcon, LogoutIcon, NextArrow, NotificationIcon, StarredMessage, Archived, IconcontactUs, IconDelete } from './images';
import { ENABLE_NOTIFICATIONS } from '../../processENV';
import { blockOfflineAction, getLocalWebsettings, setLocalWebsettings } from '../../../Helpers/Utility';
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage} from '../WebChatEncryptDecrypt';
import SDK from '../../SDK';
import { useSelector } from 'react-redux';

const imageComponent = {
    chat: ChatIcon,
    Archived: Archived,
    notification: NotificationIcon,
    blocked: BlockedIcon,
    about: InfoIcon,
    policy: InformationIcon,
    logout: LogoutIcon,
    star: StarredMessage,
    delete: IconDelete,
    contactUs :IconcontactUs,
};

export const SettingCheckBox = (props = {}) => {
    const { id, label, getaAtion, chat = false, children, dafaultSetting } = props;
    const settingsData = useSelector((state) => state.settingsData.data[id]);
    const [activeSettings, setSettings] = useState(dafaultSetting || false);

    const chatSetting = (event) => {
        if (blockOfflineAction()) return;
        setSettings(!activeSettings);
        getaAtion(!activeSettings);
    };

    const settingListener = (event) => {
        if (blockOfflineAction()) return;
        const { checked, name } = event.target;
        if (Notification.permission === 'denied' || Notification.permission === 'default') {
            setSettings(false);
            toast.error(ENABLE_NOTIFICATIONS, {
                toastId: 'Notification',
            })
        }
        else {
            const muteEnabled = !checked;
            setSettings(checked);
            SDK.updateMuteNotificationSettings(muteEnabled);
            const webSettings = getFromLocalStorageAndDecrypt('websettings')
            let parserLocalStorage = webSettings ? JSON.parse(webSettings) : {}
            const constructObject = {
                ...parserLocalStorage,
                [name]: muteEnabled
            }
            encryptAndStoreInLocalStorage('websettings', JSON.stringify(constructObject));
        }
    }

    useEffect(() => {
        if (!chat) {
            if (Notification.permission === 'denied' || Notification.permission === 'default') {
                setSettings(false);
            }
            else {
                const webSettings = getFromLocalStorageAndDecrypt('websettings');
                const settings = getLocalWebsettings();
                if (settings.Notifications === undefined) {
                    setLocalWebsettings("Notifications", true);
                    setSettings(true);
                } else {
                    let parserLocalStorage = JSON.parse(webSettings);
                    const { [id]: status = false } = parserLocalStorage;
                    setSettings(status);
                }
            }
        }
    }, [settingsData]);

    return (

        <li className="setting-list">
            <label className="setting-option">
                <div className="checkbox">
                    <input
                        name={id}
                        type="checkbox"
                        checked={chat ? dafaultSetting : activeSettings}
                        id={id}
                        onChange={chat ? chatSetting : settingListener}
                        className={!activeSettings ? "disabled" : ""}
                    />
                    <label htmlFor={id}></label>
                </div>
                <div className="label">
                    <span className="label-text">{label}</span>
                </div>
            </label>
            {children}
        </li>
    )
};


export const SettingOptions = (props = {}) => {
    const { handleOptions, label, image, enableRightArrow = true,children } = props
    const { [image]: Icon } = imageComponent
    return (
        <li className="setting-list" onClick={() => handleOptions(image)}>
            <div className="setting-option">
                {Icon && <i className="iconLeft"><Icon /></i>}
                <span className="Option-text">{label}</span>
                {enableRightArrow && <i className="iconNext"><NextArrow /></i>}
            </div>
            {children}
        </li>
    )
};

export const SettingsHeader = (props) => {
    const { handleBackFromSetting, label } = props
    return (
        <div className="setting-header">
            <div className="setting-header-text">
                <i onClick={handleBackFromSetting} className="newchat-icon" title="Back">
                    <ArrowBack />
                </i>
                <span>{label}</span>
            </div>
        </div>
    )
};
