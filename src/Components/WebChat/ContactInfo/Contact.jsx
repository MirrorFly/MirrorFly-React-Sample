import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { updateBlockedContactAction } from "../../../Actions/BlockAction";
import { getMaxUsersInCall } from "../../../Helpers/Call/Call";
import { handleTempArchivedChats } from "../../../Helpers/Chat/ChatHelper";
import { CHAT_TYPE_SINGLE, UNBLOCK_CONTACT_TYPE } from "../../../Helpers/Chat/Constant";
import { FEATURE_RESTRICTION_ERROR_MESSAGE } from "../../../Helpers/Constants";
import { getHighlightedText } from '../../../Helpers/Utility';
import Store from "../../../Store";
import SDK from "../../SDK";
import Modal from "../Common/Modal";
import { BlockPopUp } from "../PopUp/BlockPopUp";
import { getFromLocalStorageAndDecrypt } from "../WebChatEncryptDecrypt";
import ContactInfoCheckBox from "./ContactInfoCheckBox";

export default function Contact(props) {
    const { roster = {}, contactName, image, emailId, statusMsg, status, isChanged = -1, searchValue, userId, userJid, prepareContactToAdd, prepareContactToRemove, hideCheckbox, maxMemberReached, isBlocked } = props
    const [selectState, setSelectState] = useState(false);
    const [showModal, setshowModal] = useState(false);
    const [blockId, setBlockId] = useState(null);
    const [nameToDisplay, setNameToDisplay] = useState(null);
    const updateJid = userId || userJid

    const handleChange = (e) => {
        if (!isBlocked) {
            const stateToUpdate = !selectState;
            if (maxMemberReached && stateToUpdate) {
                toast.error("Maximum " + getMaxUsersInCall() + " members allowed in a call");
                return;
            }
            setSelectState(stateToUpdate)
            if (stateToUpdate) {
                prepareContactToAdd(updateJid, props)
            } else {
                prepareContactToRemove(updateJid, props)
            }
        }
    };

    const popUpToggleAction = (userIds, nameToDisplays) => {
        setshowModal(!showModal);
        setBlockId(userIds ? userIds : null)
        setNameToDisplay(nameToDisplays ? nameToDisplays : null)
    };

    const {isBlockEnabled = false} = useSelector((store) => store.featureStateData);
    const dispatchAction = async () => {
        setshowModal(!showModal);
        if(isBlockEnabled) {
            const res = await SDK.unblockUser(blockId);
            if (res && res.statusCode === 200) {
                Store.dispatch(updateBlockedContactAction(blockId, UNBLOCK_CONTACT_TYPE));
                toast.success(`${nameToDisplay || 'User'} has been Unblocked`);
                handleTempArchivedChats(blockId, CHAT_TYPE_SINGLE);
            }
        } else {
            toast.error(FEATURE_RESTRICTION_ERROR_MESSAGE);
        }
    }

    useEffect(() => {
        if (isChanged === -1) {
            setSelectState(false)
            return
        }
        setSelectState(true)
    }, [isChanged])

    useEffect(() => {
        if (isBlocked) {
            setSelectState(false)
            prepareContactToRemove(updateJid, props)
        }
    }, [isBlocked])

    const token = getFromLocalStorageAndDecrypt('token');
    const hightlightText = getHighlightedText(contactName, searchValue)

    return (
        <Fragment>
            {showModal && <Modal containerId='container'>
                <BlockPopUp
                    popUpToggleAction={popUpToggleAction}
                    dispatchAction={dispatchAction}
                    headerLabel={<>{'Unblock'} {contactName} ?</>}
                    closeLabel={'Cancel'}
                    actionLabel={'Unblock'}
                    infoLabel={'On unblocking, this contact will be able to call you or send messages to you.'}
                />
            </Modal>}
            <ContactInfoCheckBox
                image={image}
                token={token}
                userId={userId}
                status={status}
                roster={roster}
                emailId={emailId}
                userJid={userJid}
                updateJid={updateJid}
                isBlocked={isBlocked}
                statusMsg={statusMsg}
                selectState={selectState}
                contactName={contactName}
                initialName={contactName}
                handleChange={handleChange}
                hideCheckbox={hideCheckbox}
                hightlightText={hightlightText}
                popUpToggleAction={popUpToggleAction}
            />
        </Fragment>
    )
}
