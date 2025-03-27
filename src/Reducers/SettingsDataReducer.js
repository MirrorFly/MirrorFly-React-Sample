import { UPDATE_SETTINGS_DATA } from "../Actions/Constants";

const initialState = {
  id: null,
  data: {}
};

export const SettingsReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case UPDATE_SETTINGS_DATA: {
      const { id, data } = action.payload;
      return {
        ...state,
        id,
        data: {
          ...state.data, // Preserve existing data
          ...data // Merge new settings
        }
      };
    }
    default:
      return state;
  }
};
