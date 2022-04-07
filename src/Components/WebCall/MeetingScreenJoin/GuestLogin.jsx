import React from 'react';
import { MeetingLogo } from '../../../assets/images';

const GuestLogin = (props = {}) => {
    const { handleJoinCall } = props;
    return (
        <div className='m_participant_wrapper guest'>
            <div className='m_participant_details'>
                <div className='brand_logo'>
                    <img src={MeetingLogo} alt={MeetingLogo} />
                </div>
                <h2>Ready to join ?</h2>
                <div className="guest_name">
                    <input type="text" className="search-contacts" name="search-contacts" autoComplete="off" placeholder="Enter your name"></input>
                </div>
                <button type='button' onClick={handleJoinCall} className='Meeting_join'>Join Now</button>
            </div>
        </div>
    );
}

export default GuestLogin;