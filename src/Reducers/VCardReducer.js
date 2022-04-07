import { VCARD_DATA, VCARD_CONTACT_DATA_ACTION } from '../Actions/Constants';

export function VCardReducer(state = [], action = {}) {
  if (action.type === VCARD_DATA) {
    return action.payload;
  }
  return state;
}

export function VCardContactReducer(state = { data: {} }, action = {}) {
  if (action.type === VCARD_CONTACT_DATA_ACTION) {
    return action.payload;
  }
  return state;
}
