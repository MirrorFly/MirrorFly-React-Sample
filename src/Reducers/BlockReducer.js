import { BLOCK_DATA, BLOCK_STATUS, CONTACT_WHO_BLOCKED_ME } from '../Actions/Constants';

export function BlockReducer(state = {data:[]}, action={}) {
    if(action.type===BLOCK_DATA){
        return action.payload;
    }
    return state
}

export function BlockStatusReducer(state = [], action={}) {
    if(action.type===BLOCK_STATUS){
        return action.payload;
    }
    return state
}

export function contactsWhoBlockedMeReducer(state = {data:[]}, action={}){
    if(action.type===CONTACT_WHO_BLOCKED_ME){
        return action.payload;
    }
    return state
}
