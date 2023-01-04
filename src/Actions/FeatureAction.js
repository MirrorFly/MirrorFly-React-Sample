import { FEATURE_STATE_DATA } from "./Constants";

export const FeatureEnableState = (data) => {
    return {
        type: FEATURE_STATE_DATA,
        payload: data
    }
}
