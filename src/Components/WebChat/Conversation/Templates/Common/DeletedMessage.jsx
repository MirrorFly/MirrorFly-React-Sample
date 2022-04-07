import React, { Fragment, useState } from "react";
import { BlockedIcon, Menu } from '../../../../../assets/images';
import DropDownAction from './DropDownAction';
import { formatDisplayName, getSenderIdFromMsgObj } from '../../../../../Helpers/Chat/User'
import { getConversationHistoryTime, getMediaClassName } from '../../../../../Helpers/Utility';
import { THIS_MESSAGE_WAS_DELETED, YOU_DELETED_THIS_MESSAGE } from "../../../../../Helpers/Chat/Constant";
import ForwardMessage from './ForwardMessage';

const DeletedMessage = (props) => {
    const { messageAction, messageObject={}, vCardData={}, chatType="",addionalnfo={} } = props
    const { msgId="", msgType="", createdAt="" } = messageObject;
    const messageFrom = getSenderIdFromMsgObj(messageObject);
    const { fromUser: fromuser } = vCardData;
    const isSender = msgType !== "acknowledge" && messageFrom && messageFrom.indexOf(fromuser) === -1;
    const [dropDownStatus, setDropDown] = useState(false);
    const handleDropDown = (event) => {
        event.stopPropagation();
        setDropDown(!dropDownStatus)
    }

    const sentMessageToParent = (event) => {
        setDropDown(!dropDownStatus)
        messageAction(event, messageObject)
    }
    const { forward = false, forwardMessageId , deleteAction } = addionalnfo;
    const { nameToDisplay, userColor } = isSender ? formatDisplayName(messageFrom) : {}
    const [isChecked, selectedToForward] = useState(false);
    const style = { color: userColor };
    const selectMessage = (checked) => {
        selectedToForward(checked);
      };

    return (
        <Fragment>
            <div 
            id={msgId} 
            className={getMediaClassName(dropDownStatus, isSender, forward, 2, isChecked)}
            >
            {deleteAction ?
            <ForwardMessage
                selectedToForward={selectMessage}
                forwardMessageId={forwardMessageId}
                forward={forward}
                msgid={msgId}
                timestamp={0}
                />
                :
                <div></div>
            }
                <div className={`${isSender ? "sender " : "receiver"} sender-text-group`}>
                    {isSender && chatType !== "chat" && <span className="sender-name" style={style} >{nameToDisplay}</span>}
                    <div className="message-text">
                        <span className='recallstatus deleted_messge text-italic'> <i><BlockedIcon/></i> {isSender ? THIS_MESSAGE_WAS_DELETED : YOU_DELETED_THIS_MESSAGE}</span>
                    </div>
                    {createdAt && <span className="message-time">
                        <span className="msg-sent-time">
                        {getConversationHistoryTime(createdAt)}
                        </span>
                    </span>}
                    {!forward  && (
                    <div className="message-dropdown-menu" >
                        <span className="message-dropdown">
                        <span data-jest-id="jestHandleDropDown" className="actionDrop" onClick={handleDropDown}></span>
                        <i><Menu /></i></span>
                        {dropDownStatus &&
                         <DropDownAction msgid={msgId} recall={true} handleDropDown={handleDropDown} messageAction={sentMessageToParent} />}
                    </div>
                    )}
                </div>
            </div>
        </Fragment>
    )
}

export default DeletedMessage
