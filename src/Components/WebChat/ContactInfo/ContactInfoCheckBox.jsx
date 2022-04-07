import React from "react";
import UserStatus from '../Common/UserStatus';
import ProfileImage from '../Common/ProfileImage';
import { initialNameHandle } from "../../../Helpers/Chat/User";

const ContactInfoCheckBox = (props = {}) => {
    const {
        image = "",
        token = "",
        userId = "",
        status = "",
        roster = {},
        emailId = "",
        userJid = "",
        updateJid = "",
        isBlocked = false,
        statusMsg = "",
        selectState = false,
        contactName = "",
        initialName = "",
        hideCheckbox,
        hightlightText = "",
        handleChange = () => { },//click
        popUpToggleAction = () => { },//click
    } = props;
    const iniTail = initialNameHandle(roster, initialName);
    return (
        <React.Fragment>
            <li className={isBlocked ? "chat-list-li Blocked bc-none" : "chat-list-li"} data-ld={updateJid}>
                <label htmlFor={updateJid}>
                    {
                        <ProfileImage
                            chatType={'chat'}
                            userToken={token}
                            temporary={false}
                            imageToken={image}
                            emailId={emailId}
                            userId={userId}
                            name={iniTail}
                            initialName={initialName}
                        />
                    }
                    <div className="recentchats">
                        <div className="recent-username-block">
                            <div className="recent-username">
                                <span className="username">
                                    <h3 title={contactName}><span>{hightlightText}</span></h3>
                                </span>
                            </div>
                        </div>
                        <div className="recent-message-block">
                            <UserStatus status={statusMsg || status} userId={updateJid} />
                        </div>
                        {!hideCheckbox && <div className="checkbox">
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
                        }
                    </div>
                    {isBlocked &&
                        <span
                            className="Unblock"
                            data-jest-id={"jestpopUpToggleAction"}
                            onClick={() => { popUpToggleAction(userJid, contactName) }}
                        >
                            Unblock
                        </span>
                    }
                </label>
            </li>
        </React.Fragment>
    )
}
export default ContactInfoCheckBox;
