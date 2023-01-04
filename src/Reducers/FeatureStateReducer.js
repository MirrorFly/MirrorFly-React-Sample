import { FEATURE_STATE_DATA } from "../Actions/Constants";

export function FeatureStateReducer(state = {data: null}, action = {}){
    if(action.type === FEATURE_STATE_DATA){
        return action.payload;
    }
    return state;
}