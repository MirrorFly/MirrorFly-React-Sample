import uuidv4 from 'uuid/v4';
import { ROSTER_DATA_UPDATE, VCARD_DATA, VCARD_CONTACT_DATA_ACTION } from './Constants';

export const VCardDataAction = (data) => {
  return {
    type: VCARD_DATA,
    payload: {
      id: uuidv4(),
      data
    }
  }
}

const rosterUpdate = (data) =>{
  return {
    type: ROSTER_DATA_UPDATE,
    payload: {
      id: uuidv4(),
      data
    }
  };
}

const vcardUpdate = (data) => {
  return {
    type: VCARD_CONTACT_DATA_ACTION,
    payload: {
      id: uuidv4(),
      data
    }
  };
}

export const VCardContactDataAction = (data) => (dispatch) => {
     dispatch(rosterUpdate(data));
     dispatch(vcardUpdate(data))
}
