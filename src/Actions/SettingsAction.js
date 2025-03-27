import uuidv4 from 'uuid/v4';
import { UPDATE_SETTINGS_DATA } from './Constants';

export const SettingsDataAction = (data) => {
    return {
        type: UPDATE_SETTINGS_DATA,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
