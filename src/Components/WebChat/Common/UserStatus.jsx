import React from 'react';
import renderHTML from 'react-render-html';
import { isUserWhoBlockedMe } from '../../../Helpers/Chat/BlockContact'
import { DEFAULT_USER_STATUS } from '../../../Helpers/Chat/Constant';

const UserStatus = ({status, blocked, userId}) => {
    if(typeof blocked === 'undefined' && userId){
        blocked = isUserWhoBlockedMe(userId);
    }

    if(blocked) return '';

    const userStatus = status ? status : DEFAULT_USER_STATUS;
    return <span className="status" title={userStatus}><span className="status-text">{renderHTML(userStatus)}</span></span>;
}

export default UserStatus;
