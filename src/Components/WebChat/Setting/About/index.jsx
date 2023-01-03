import './About.scss';
import ContactUs from '../ContactUs';
import AboutDetails from './AboutDetails';
import PrivacyPolicy from './PrivacyPolicy';
import React, { Component, Fragment } from 'react';
import { SettingOptions, SettingsHeader } from '../Settings';
import { REACT_APP_PRIVACY_POLICY, REACT_APP_TERMS_AND_CONDITIONS } from '../../../processENV';
export default class About extends Component {
    constructor(props) {
        super(props)
        this.state = {
            parentAboutStatus: true,
            activeTab: null,
        };
    }

    backToAbout = () => {
        this.setState({
            parentAboutStatus: true,
            activeTab: null
        });
    }

    handleAbout = (label) => {
        this.setState({
            parentAboutStatus: false,
            activeTab: label
        });
    }

    handleContactUs = (label) => {
        this.setState({
            parentAboutStatus: true,
            activeTab: label
        });
    }

    handlePopupClose = () => {
        this.setState({
            parentAboutStatus: true,
            activeTab: null
        });
    }


    render() {
        let { parentAboutStatus, activeTab } = this.state
        const { handleBackToSetting } = this.props
        return (
            <Fragment>
                {parentAboutStatus &&
                    <div className="setting-container">
                        <div>
                            <div className="settinglist">
                                <SettingsHeader
                                    handleBackFromSetting={handleBackToSetting}
                                    label={'About and Help'}
                                />
                                <ul className="setting-list-ul About">
                                    <SettingOptions
                                        image={'about'}
                                        label={'About Us'}
                                        handleOptions={this.handleAbout}
                                    />
                                    <SettingOptions
                                        image={'contactUs'}
                                        label={'Contact Us'}
                                        enableRightArrow={false}
                                        handleOptions={this.handleContactUs}
                                    />
                                    <SettingOptions
                                        image={'policy'}
                                        enableRightArrow={false}
                                        handleOptions={() => { }}
                                        label={'Terms and Privacy Policy'}
                                    >
                                        <div className='setting_privacy_content'>
                                            <div className='setting_privacy_link'>
                                                <a href={REACT_APP_TERMS_AND_CONDITIONS} target="_blank" rel="noopener noreferrer">Terms and Conditions,</a>
                                                <a href={REACT_APP_PRIVACY_POLICY} target="_blank" rel="noopener noreferrer">Privacy Policy.</a>
                                            </div>
                                        </div>
                                    </SettingOptions>
                                </ul>
                            </div>
                        </div>
                    </div>
                }
                {!parentAboutStatus &&
                    <Fragment>
                        {activeTab === 'about' && <AboutDetails backToAbout={this.backToAbout} />}
                        {activeTab === 'policy' && <PrivacyPolicy backToAbout={this.backToAbout} />}
                    </Fragment>}
                {activeTab === 'contactUs' && <ContactUs handlePopupClose={this.handlePopupClose} />}
            </Fragment>
        );
    }
}
