import { contactWhoBlockedMeAction } from '../../Actions/BlockAction';
import Store, { getStoreState } from '../../Store';
import { encryption } from '../../Components/WebChat/WebChatEncryptDecrypt';
import { formatUserIdToJid } from './User';

/**
 * @param {*} dataArr
 */
export const formatToArrayofJid = (dataArr) => {
    return dataArr.map(data => formatUserIdToJid(data.jid));
}

export const setContactWhoBleckedMe = (data) => {
    encryption('blockuserlist_data', data);
    Store.dispatch(contactWhoBlockedMeAction(data));
}

export const isUserIBlocked = (userJid) => {
    if(!userJid) return false;
    const state = getStoreState();
    const blockedContact = (state.blockedContact && state.blockedContact.data) || [];
    userJid = formatUserIdToJid(userJid);
    return blockedContact.indexOf(userJid) > -1;
}

export const isUserWhoBlockedMe = (userJid) => {
    if(!userJid) return false;
    const state = getStoreState();
    const contactsWhoBlockedMe = (state.contactsWhoBlockedMe && state.contactsWhoBlockedMe.data) || [];
    userJid = formatUserIdToJid(userJid);
    return contactsWhoBlockedMe.indexOf(userJid) > -1;
}
