import React from 'react';
import { NewLogoVector } from '../../assets/images';
import { REACT_APP_CONTACT_EMAIL } from '../processENV';
import "./BlockedFromApplication.scss"
import IconBlocked from "./blocked_user.svg";

function BlockedFromApplication(props = {}) {
    return (
        <div className='login-container blocked_from_application'>
            <div className="mirrorfly newLoginScreen">
                <div className="login-wrapper">
                    <div className='login-content'>
                        <div className='blocked_user_wraper'>
                            <div className='logo_container'>
                                <img src={NewLogoVector} alt="logo" />
                            </div>
                            <img className='icon_blocked' src={IconBlocked} alt="blocked icon" />
                            <p>This application is no longer available for you.</p>
                            <span>Please contact admin if you have any query.</span>
                            <a href={`mailto:${REACT_APP_CONTACT_EMAIL}`}>{REACT_APP_CONTACT_EMAIL}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlockedFromApplication;
