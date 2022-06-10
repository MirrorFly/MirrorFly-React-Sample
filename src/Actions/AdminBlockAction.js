import uuidv4 from 'uuid/v4';
import {
    ADMIN_BLOCK_LIST,} from './Constants';

export const adminBlockStatusUpdate = (data) => {
    return {
        type: ADMIN_BLOCK_LIST,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
