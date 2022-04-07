import { UPDATE_ARCHIVE_CHAT } from "../Actions/Constants";

const initialState = {
  id: null,
  data: {
    isArchived: false
  }
};

export function CommonDataReducer(state = initialState, action = {}) {
  const { id, data } = action.payload || {};
  if (action.type === UPDATE_ARCHIVE_CHAT) {
    return {
      ...state,
      ...{
        id: id,
        data: {
          ...data,
          isArchived: data.isArchived
        }
      }
    };
  }

  return state;
}
