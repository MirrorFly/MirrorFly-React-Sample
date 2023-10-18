import uuidv4 from 'uuid/v4';
import { SHOW_MODAL, HIDE_MODAL, POPUP_SHOW_HIDE } from './Constants';

export const showModal = (data) => dispatch => {
  dispatch({
    type: SHOW_MODAL,
    payload: {
        id: uuidv4(),
        data
    }
  })
}

export const hideModal = () => dispatch => {
  dispatch({
    type: HIDE_MODAL
  })
}

export const popupStatus = (status) => dispatch => {
  dispatch({
    type: POPUP_SHOW_HIDE,
    payload: {
      status
    }
  })
}
