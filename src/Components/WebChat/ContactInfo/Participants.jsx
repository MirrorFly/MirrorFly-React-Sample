import React, { useState, useEffect } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { showModal } from '../../../Actions/PopUp';
import {  DropdownArrow } from '../../../assets/images';
import Store from '../../../Store';
import ProfileImage from '../Common/ProfileImage';
import { formatUserIdToJid, isLocalUser, getUserNickName, getContactNameFromRoster, getDataFromRoster, isDisplayNickName } from '../../../Helpers/Chat/User';
import UserStatus from '../Common/UserStatus';
import { getFormatPhoneNumber } from '../../../Helpers/Utility';
import { getFromLocalStorageAndDecrypt } from '../WebChatEncryptDecrypt';
import { REACT_APP_CONTACT_SYNC } from '../../processENV';

const Participants = (props) => {

    const { isAdmin, groupuniqueId, members: { GroupUser, userId: fromuser, username, image, thumbImage, userId, emailId, status, statusMsg, userType } = {} } = props
    const displayName = isLocalUser(userId) ? "You" : getContactNameFromRoster(getDataFromRoster(userId)) || getFormatPhoneNumber(userId);

    const [menuDropDownStatus, setmenuDropDownStatus] = useState(false)
    useEffect(() => {
        if(!isAdmin){
            setmenuDropDownStatus(false);
        }
    }, [isAdmin])

    const updateJid = userId || username || GroupUser;
    const handleMenuDrop = () => {
        if (isAdmin)
            setmenuDropDownStatus(!menuDropDownStatus)
    }
    const makeAdmin = () => {
        const userjid = formatUserIdToJid(updateJid);
        Store.dispatch(showModal({
            groupuniqueId,
            userjid,
            displayName,
            open: true,
            modelType: 'action',
            title: 'Make '+displayName+' an admin for this group?',
            activeclass: 'make-admin',
            action: 'groupMakeAdmin'
        }))
        setmenuDropDownStatus(false)
    }
    const removeUser = () => {
        const userjid = formatUserIdToJid(updateJid);
        const checkAdmin = (userType === 'o') ? 1 : 0
        setmenuDropDownStatus(false)
        Store.dispatch(showModal({
            groupuniqueId,
            userjid,
            displayName,
            checkAdmin,
            open: true,
            title: 'Remove '+displayName+' from this group?',
            activeclass: 'remove-participant',
            modelType: 'action',
            action: 'groupRemoveMember'
        }))
    }
    const updateStatus = status || statusMsg || ''
    const localUser = isLocalUser(fromuser)
    const nickName = getUserNickName(props.members);
    const token = getFromLocalStorageAndDecrypt('token');
    let displayNickname = false;
    if (REACT_APP_CONTACT_SYNC) {
        displayNickname = isDisplayNickName(props.members);
    }

    const getInitalName = () => {
        if (localUser) return nickName;
        // else if (displayNickname) return "";
        else return displayName;
    }

    return (

        <li>
            <OutsideClickHandler onOutsideClick={() => {
                if (menuDropDownStatus) {
                    handleMenuDrop()
                }
            }} >
                <div className="user-profile-name">
                    {
                    <ProfileImage
                        chatType={'chat'}
                        userToken={token}
                        temporary={false}
                        imageToken={(thumbImage && thumbImage !== "") ? thumbImage : image}
                        emailId={emailId}
                        userId={updateJid}
                        name={getInitalName()}
                    />
                    }
                    <div className="profile-name">
                        <span>
                            <h4 className={!localUser ? 'participant' : ''}>{displayName}</h4>
                            {displayNickname ? <h6 className="profile-nickname" title={nickName}>&#126; {nickName}</h6> : ''}
                            {!localUser && isAdmin && <i className={(menuDropDownStatus) ? 'menu-icon open' : 'menu-icon'} onClick={handleMenuDrop}><DropdownArrow /> </i>}
                        </span>
                        <h6 className="profile-status">
                            <UserStatus status={updateStatus} userId={updateJid} />
                            {userType === 'o' && <span className={'adminicon'}>Admin</span>}
                        </h6>
                        {menuDropDownStatus && !isLocalUser(updateJid) &&
                            <ul className="menu-dropdown">
                                {userType !== 'o' && <li onClick={makeAdmin}><span>Make admin</span></li>}
                                <li onClick={removeUser}><span>Remove from Group</span></li>
                            </ul>
                        }
                    </div>
                </div>
            </OutsideClickHandler>

        </li>
    );
};

export default Participants;
