import uuidv4 from 'uuid/v4';
import {
    CREATE_BROADCAST, UPDATE_BROADCAST
} from './Constants';

export const createBroadCast = (data) => {
    return {
        type: CREATE_BROADCAST,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const updateBroadCast = (data, dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({
            type: UPDATE_BROADCAST,
            payload: {
                id: uuidv4(),
                data
            }
        })
        resolve(true)
    })
}
