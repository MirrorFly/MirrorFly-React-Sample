import React, { useEffect, useState } from 'react';
import { getNameAndStatus } from '../../../Helpers/Chat/ChatHelper';
import { timeFormat } from '../../../Helpers/Chat/RecentChat';
import ProfileImage from '../Common/ProfileImage';
import { getContactNameFromRoster, initialNameHandle } from '../../../Helpers/Chat/User';
import { getUserFromGroup } from '../../../Helpers/Chat/Group';
import { getFromLocalStorageAndDecrypt } from '../WebChatEncryptDecrypt';

const Members = (props = {}) => {
    const { jid = "", rosterData: { data: rosterArray = [] } = {}, time = "" } = props;
    const [getDetails, setDetails] = useState({})

    useEffect(() => {
        let details = getNameAndStatus(jid, rosterArray);
        if (!details || Object.keys(details).length === 0) {
            details = getUserFromGroup(jid) || { userId: jid };
        }
        setDetails({
            ...details
        })
    }, [props.rosterData])

    const { image, emailId, thumbImage } = getDetails
    const token = getFromLocalStorageAndDecrypt('token');
    let username = getContactNameFromRoster(getDetails);
    const updateTime = timeFormat(time);
    const iniTail = initialNameHandle(getDetails, username);

    return (
        <li className="chat-list-li">
            <ProfileImage
                chatType={'chat'}
                userToken={token}
                imageToken={thumbImage !== "" ? thumbImage : image}
                emailId={emailId}
                temporary={true}
                name={iniTail}
            />
            <div className="recentchats">
                <div className="recent-username-block">
                    <div className="recent-username">
                        <div className="username">
                            <h3 title={username}>{username}</h3>
                        </div>
                    </div>
                </div>
                <div className="recent-message-block"><span>{updateTime}</span></div>
            </div>
        </li>
    );
}

export default Members;
