import React from "react";
import { useDispatch } from 'react-redux';
import { ClosePopup, IconNetwork } from "../../assets/images";
import "./NetworkError/NetworkError.scss";
import { setPoorConnectionIcon, setPoorConnectionPopUp } from "../../Actions/CallAction";

const NetworkErrorStatus = () => {
    const dispatch = useDispatch();

    const onClosePoupClick = () => {
        dispatch(setPoorConnectionIcon(true));
        dispatch(setPoorConnectionPopUp(false));
    }

    return (
        <div className="network_error_box_overall">
          <div className="flex network_error_box">
            <div className="network_icon">
                    <IconNetwork />
            </div>
            <div className="network_right">
            <button type="button" className="closepopup" onClick={onClosePoupClick}><ClosePopup /></button>
            <h1>Poor Connection</h1>
            <p>Try moving to get better signal</p>
            </div>
        </div>
        </div >
    )
};

export default React.memo(NetworkErrorStatus);