import uuidv4 from 'uuid/v4';
import { BLOCK_DATA, CONTACT_WHO_BLOCKED_ME } from './Constants';
import { BLOCK_CONTACT_TYPE, UNBLOCK_CONTACT_TYPE } from '../Helpers/Chat/Constant';
import { formatUserIdToJid } from '../Helpers/Chat/User';

/**
 * Action to add the contacts who I blocked
 * @param {*} data - [userjid1, userjid, ...]
 */
export const blockedContactAction = (data) => {
    return dispatch => {
        dispatch({
            type: BLOCK_DATA,
            payload: {
                id: uuidv4(),
                data: data || []
            }
        });
    };
}

/**
 * Action to update the contacts who I blocked
 * @param {*} userJid
 * @param {*} blockType
 */
export const updateBlockedContactAction = (userJid, blockType = BLOCK_CONTACT_TYPE) => {
    return (dispatch, getState) => {
        const state = getState();
        userJid = formatUserIdToJid(userJid);
        const blockedContact = state.blockedContact.data;

        const blockedContactIndex = blockedContact.indexOf(userJid);
        if(blockType === BLOCK_CONTACT_TYPE && blockedContactIndex === -1){
            blockedContact.push(userJid);
        }

        if(blockType === UNBLOCK_CONTACT_TYPE && blockedContactIndex > -1){
            blockedContact.splice(blockedContactIndex, 1);
        }
        dispatch(blockedContactAction(blockedContact));
    }
}

/**
 * Action to add the contacts who blocked me
 * @param {Array} data - [userjid1, userjid, ...]
 */
export const contactWhoBlockedMeAction = (data) => {
    return dispatch => {
        dispatch({
            type: CONTACT_WHO_BLOCKED_ME,
            payload: {
                id: uuidv4(),
                data: data || []
            }
        });
    };
}

/**
 * Action to update the contacts who blocked me
 * @param {*} userJid
 * @param {*} blockType
 */
export const updateContactWhoBlockedMeAction = (userJid, blockType = BLOCK_CONTACT_TYPE) => {
    return (dispatch, getState) => {
        const state = getState();
        userJid = formatUserIdToJid(userJid);
        const contactsWhoBlockedMe = state.contactsWhoBlockedMe.data;
        const blockedContactIndex = contactsWhoBlockedMe.indexOf(userJid);
        if(blockType === BLOCK_CONTACT_TYPE && blockedContactIndex === -1){
            contactsWhoBlockedMe.push(userJid);
        }

        if(blockType === UNBLOCK_CONTACT_TYPE && blockedContactIndex > -1){
            contactsWhoBlockedMe.splice(blockedContactIndex, 1);
        }
        dispatch(contactWhoBlockedMeAction(contactsWhoBlockedMe));
    }
}
