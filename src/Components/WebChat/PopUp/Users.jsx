import React, { Fragment, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import Config from "../../../config";
import { getHighlightedText } from '../../../Helpers/Utility';
import { REACT_APP_XMPP_SOCKET_HOST } from '../../processENV';
import ProfileImage from '../Common/ProfileImage';
import UserStatus from '../Common/UserStatus';
import { getIdFromJid, initialNameHandle } from "../../../Helpers/Chat/User";
import { isSingleChat } from "../../../Helpers/Chat/ChatHelper";
import { BlockedIcon } from "../Setting/images";
import { getFromLocalStorageAndDecrypt } from "../WebChatEncryptDecrypt";

const { maximumAllowedUsersToForward } = Config

export default function Users(props) {

    const { contactName, image, groupImage, thumbImage, emailId, statusMsg, status,
        searchValue, updateJid, addContact, removeContact,
        temporary, chatType, selectedContact, isChanged = -1, isBlockedUser, roster } = props;
    const iniTail = initialNameHandle(roster, contactName);
    const [selectState, setSelectState] = useState(false)

    useEffect(() => {
        if (isChanged === -1) {
            setSelectState(false)
            return
        }
        setSelectState(true)
    }, [isChanged])

    const handleChange = (e) => {
        if (isBlockedUser) return;
        let jidWithHost = ''
        if (chatType === 'chat' || chatType === 'broadcast') {
            if (chatType === 'broadcast') {
                jidWithHost = updateJid + "@" + REACT_APP_XMPP_SOCKET_HOST + "@"
            } else {
                jidWithHost = updateJid + "@" + REACT_APP_XMPP_SOCKET_HOST
            }
        } else {
            jidWithHost = updateJid + "@mix." + REACT_APP_XMPP_SOCKET_HOST;
        }

        if (selectedContact >= maximumAllowedUsersToForward && e.target.checked) {
            setSelectState(false);
            removeContact(jidWithHost, contactName, updateJid)
            const message = `You can only forward with up to ${maximumAllowedUsersToForward} users or groups`;
            toast.error(message);
            return
        }
        setSelectState(!selectState);
        selectState === false ? addContact(jidWithHost, contactName, updateJid) : removeContact(jidWithHost, contactName, updateJid)
    }

    const token = getFromLocalStorageAndDecrypt('token');
    const hightlightText = getHighlightedText(contactName, searchValue)
    const updatedStatus = statusMsg || status;
    return (
        <Fragment>
            <label htmlFor={updateJid}>
                <div className="checkbox">
                    <input
                        name="participants"
                        type="checkbox"
                        checked={selectState}
                        onChange={handleChange}
                        value={selectState}
                        id={updateJid}
                    />
                    <label htmlFor={updateJid}></label>
                </div>
                {
                    <ProfileImage
                        chatType={chatType}
                        userToken={token}
                        temporary={temporary}
                        imageToken={thumbImage !== "" ? thumbImage : image || groupImage}
                        emailId={emailId}
                        userId={getIdFromJid(updateJid)}
                        name={iniTail}
                    />
                }
                <div className="recentchats">
                    <div className="recent-username-block">
                        <div className="recent-username">
                            <div className="username">
                                <h3 title={contactName}>
                                    <span>{hightlightText}</span>
                                    {isBlockedUser &&
                                        <div className="blocked-info">
                                            <i><BlockedIcon /></i><span>Blocked</span>
                                        </div>
                                    }
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="recent-message-block">
                        {isSingleChat(chatType) && <UserStatus status={updatedStatus} userId={updateJid} />}
                    </div>
                </div>
            </label>

        </Fragment>
    )
}
