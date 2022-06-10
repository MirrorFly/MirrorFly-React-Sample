import React, { useState } from 'react';
import { SettingsHeader } from '../Settings';
import NumberVerificationForm from './NumberVerificationForm';
import './DeleteMyAccount.scss';
import UserFeedbackForm from './UserFeedbackForm';

const DeleteMyAccount = (props = {}) => {
    const {
        handleBackToSetting = () => { },
    } = props;
    const [verifyNumber, setVerifyNumber] = useState(false);

    const handleNumberVerified = (state) => {
        setVerifyNumber(state)
    }
    
    return (
        <React.Fragment>
            <div className="setting-container">
                <div>
                    <div className="settinglist">
                        <SettingsHeader
                            handleBackFromSetting={handleBackToSetting}
                            label={'Delete My Account'}
                        />
                        <div className='content_wraper'>
                            {!verifyNumber ?
                                <NumberVerificationForm
                                    handleNumberVerified={handleNumberVerified}
                                />
                                :
                                <UserFeedbackForm
                                />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default DeleteMyAccount;