import React, { Component, Fragment } from 'react';
import { SettingOptions, SettingsHeder } from '../Settings';
import AboutDetails from './AboutDetails';
import './About.scss';
import PrivacyPolicy from './PrivacyPolicy';
export default class About extends Component {
    constructor(props) {
        super(props)
        this.state = {
            parentAboutStatus: true,
            activeTab: null
        };
    }

    backToAbout = () => {
        this.setState({
            parentAboutStatus: true,
            activeTab: null
        });
    }

    handleAbout = (label) =>{
        this.setState({
            parentAboutStatus: false,
            activeTab: label
        });
    }

    render() {
        let { parentAboutStatus, activeTab } = this.state
        const { handleBackToSetting } = this.props
        return (
            <Fragment>
                { parentAboutStatus &&
                    <div className="setting-container">
                        <div>
                            <div className="settinglist">
                                <SettingsHeder
                                    handleBackFromSetting={handleBackToSetting}
                                    label={'About and Help'}
                                />
                                <ul className="setting-list-ul About">
                                    <SettingOptions handleOptions={this.handleAbout} label={'About Us'} image={'about'} />
                                    <SettingOptions handleOptions={this.handleAbout} label={'Terms and Privacy Policy'} image={'policy'} />
                                </ul>
                            </div>
                        </div>
                    </div>
                }
                { !parentAboutStatus &&
                    <Fragment>
                        {activeTab === 'about' && <AboutDetails backToAbout={this.backToAbout} />}
                        {activeTab === 'policy' && <PrivacyPolicy backToAbout={this.backToAbout} />}
                    </Fragment>}
            </Fragment>
        );
    }
}
