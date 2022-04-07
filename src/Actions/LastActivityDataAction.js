import uuidv4 from 'uuid/v4';
import { LAST_ACTIVITY_DATA } from './Constants';

export const LastActivityDataAction = (data) => {
    return {
        type: LAST_ACTIVITY_DATA,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
