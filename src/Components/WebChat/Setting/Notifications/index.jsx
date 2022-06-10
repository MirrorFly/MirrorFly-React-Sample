import React, { Component } from 'react';
import { SettingCheckBox, SettingsHeader } from '../Settings';
import './../Setting.scss';
import './Notifications.scss';
export default class Notifications extends Component {

    render() {
        const { handleBackToSetting } = this.props
        return (
            <div className="setting-container">
                <div>
                    <div className="settinglist">
                        <SettingsHeader
                            label={'Notifications'}
                            handleBackFromSetting={handleBackToSetting}
                        />
                        <ul className="setting-list-ul notifications">
                            {
                            //hidden due to functionality  issue
                            /* <SettingCheckBox
                                id="Sound"
                                label="Sound"
                            /> */}
                            <SettingCheckBox
                                id="Notifications"
                                label="Notifications"
                            />
                        </ul>
                    </div>

                </div>
            </div>
        );
    }
}
