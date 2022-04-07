import { STORE_TRANSLATE_LANGUAGES } from './Constants';
import uuidv4 from 'uuid/v4';

/**
 * @param  {Array} data=[]
 * language array has been pass
 */
export const transLateLanguageAction = (data =[]) => {
    return {
        type: STORE_TRANSLATE_LANGUAGES,
        payload: {
            id: uuidv4(),
            translateLanguages:data
        }
    }
}
