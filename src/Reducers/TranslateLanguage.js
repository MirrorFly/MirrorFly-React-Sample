import { INITIAL_TRANSLATE_MESSAGE, STORE_TRANSLATE_LANGUAGES } from "../Actions/Constants";

export const initialTransLate = {
  translateLanguages: {}
};

export const TranslateLanguage = (state = initialTransLate, action = {}) => {

  switch (action.type) {
    case INITIAL_TRANSLATE_MESSAGE: {
      return {
        ...state,
        ...initialTransLate,
      };
    }
    case STORE_TRANSLATE_LANGUAGES: {
      const { payload = {} } = action;
      return {
        ...state,
        translateLanguages: payload,
      };
    }
    default:
      return {
        ...state
      };
  }
};
