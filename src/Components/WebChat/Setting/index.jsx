import React, { Component, Fragment } from 'react';
import StarredMessages from '../Starred/StarredMessages';
import About from './About';
import Blocked from './BlockedContacts';
import Notification from './Notifications';
import './Setting.scss';
import { SettingOptions, SettingsHeder } from './Settings';
import Chat from './Chat';
import Archive from './ArchivedChat/index';
import { getTranslateTargetLanguage, setLocalWebsettings } from '../../../Helpers/Utility';
import SDK from '../../SDK';
import { REACT_APP_GOOGLE_TRANSLATE_API_KEY } from '../../processENV';
import Store from '../../../Store';
import { transLateLanguageAction } from '../../../Actions/TranslateAction';

const optionsArray = [
    { label: 'Chat', image: 'chat' },
    { label: 'Archived Settings', image:'Archived' },
    { label: 'Notifications', image: 'notification' },
    { label: 'Starred', image: 'star' },
    { label: 'Blocked', image: 'blocked' },
    { label: 'About and Help', image: 'about' }
];
export default class Setting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            parrentView: true,
            activeTab: null,
            setLaunguage: "English",
        }
    }

    handleSettings = (label = "") => {
        this.setState({
            parrentView: false,
            activeTab: label
        });
    }
    getLanguages = async () => {
        try {
            const result = await SDK.getTranslateLanguages(REACT_APP_GOOGLE_TRANSLATE_API_KEY);
            const { data: { languages = [] } = {}, statusCode = 0 } = result || {};
            if (statusCode === 200) {
                Store.dispatch(transLateLanguageAction(languages));
            }
        } catch (error) { }
    };

    handleBackToSetting = (e) => {
        this.setState({
            parrentView: true,
        });
    }

    setNotificationSettings = (value) => {
        return value;
    }

    setSelectedLaun = () => {
        const globalData = Store.getState();
        const { TranslateLanguage: { translateLanguages: { translateLanguages = [] } } } = globalData || {}
        const langIndex = translateLanguages?.findIndex(i => i.language === getTranslateTargetLanguage());
        const langSelected = translateLanguages[langIndex]?.name;
        return langSelected;
    }

    componentDidUpdate = () => {
        this.setSelectedLaun();
        getTranslateTargetLanguage() === "" && setLocalWebsettings("translateLang", "en");
    }

    componentDidMount = () => {
        this.getLanguages();
    }

    render() {
        const { handleBackFromSetting } = this.props
        const { parrentView, activeTab } = this.state
        return (
            <Fragment>
                { parrentView &&
                    <div className="setting-container">
                        <div>
                            <div className="settinglist">
                                <SettingsHeder
                                    handleBackFromSetting={handleBackFromSetting}
                                    label={'Settings'}
                                />
                                <ul className="setting-list-ul">
                                    {
                                        optionsArray.map(options => {
                                            const { label, image } = options
                                            return <SettingOptions
                                                key={image}
                                                handleOptions={this.handleSettings}
                                                label={label}
                                                image={image}
                                            />
                                        })
                                    }
                                    <SettingOptions handleOptions={this.props.logoutStatus} label={'Logout'} image={'logout'} />
                                </ul>
                            </div>
                        </div>
                    </div>
                }
                {!parrentView &&
                    <Fragment>
                        {activeTab === 'Archived' && <Archive handleBackToSetting={this.handleBackToSetting} />}
                        {activeTab === 'chat' &&
                            <Chat
                                setSelectedLaun={(this.setSelectedLaun() !== "") ? this.setSelectedLaun() : "English"}
                                handleBackToSetting={this.handleBackToSetting} />}
                        {activeTab === 'notification' && <Notification handleBackToSetting={this.handleBackToSetting} />}
                        {activeTab === 'star' && <StarredMessages handleBackToSetting={this.handleBackToSetting} />}
                        {activeTab === 'blocked' && <Blocked handleBackToSetting={this.handleBackToSetting} />}
                        {activeTab === 'about' && <About handleBackToSetting={this.handleBackToSetting} />}
                    </Fragment>
                }
            </Fragment>
        );
    }
}
