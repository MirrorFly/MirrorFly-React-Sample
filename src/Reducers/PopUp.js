import { SHOW_MODAL, HIDE_MODAL, POPUP_SHOW_HIDE } from '../Actions/Constants';

const initialState = {
    modalType: null,
    modalProps: {
      open: false
    }
  }

export function PopUp(state = initialState, action = {}) {
    switch (action.type) {
      case SHOW_MODAL:
        return {
          modalProps: {
             ...action.payload.data
          },
          type: action.type
        }
      case HIDE_MODAL:
        return initialState;
      case POPUP_SHOW_HIDE:
        return {
          modalProps: {
            status: action.payload.status
          }
        }
      default:
        return state;
    }
  }
