import { LAST_ACTIVITY_DATA } from '../Actions/Constants';

export function LastActivityReducer(state = [], action = {}) {
   if (action.type === LAST_ACTIVITY_DATA) {
      return action.payload;
   }
   return state;
}
