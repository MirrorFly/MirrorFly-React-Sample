import uuidv4 from 'uuid/v4';
import { PRESENCE_STATUS } from './Constants';

export const PresenceDataAction = (data) => {
    return {
        type: PRESENCE_STATUS,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
