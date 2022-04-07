import {
    POPUP_STATE,
    TYPED_CONTENT
} from '../Actions/Constants';

const initialConverseState = {
    smileyPopUp: {
        id: null,
        active: false
    },
    composedMessage: []
}

const upsert = (messageContent, stateContent = []) => {
    const { jid: newJid, message } = messageContent
    if (message) {
        if(!stateContent.find(singleContent=>singleContent.jid === newJid)) {
           return [
               ...stateContent,
               messageContent
           ]
        }
        return stateContent.map(singleContent => {
            const { jid } = singleContent
            if (jid === newJid) {
                return messageContent
            }
            return singleContent
        })
    }
    return stateContent.filter(singleContent => singleContent.jid !== newJid)
}

export function ConversationState(state = initialConverseState, action = {}) {
    const { popUpId, localState, messageContent } = action.payload || {};
    const { name } = localState || {}
    switch (action.type) {
        case TYPED_CONTENT:
            return {
                ...state,
                composedMessage: upsert(messageContent, state.composedMessage)
            }
        case POPUP_STATE:
            return {
                ...state,
                popUpId: popUpId,
                [name]: {
                    popUpId: popUpId,
                    ...localState
                }
            }
        default:
            return state;
    }
}
