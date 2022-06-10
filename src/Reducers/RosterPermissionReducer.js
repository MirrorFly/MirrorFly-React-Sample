import {
    ROSTER_PERMISSION
} from "../Actions/Constants";

export function RosterPermissionReducer(state = [], action = {}) {
    if (action.type === ROSTER_PERMISSION) {
        return action.payload;
    }
    return state;
}