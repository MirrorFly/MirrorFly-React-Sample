import React from "react";
import "./BlockPopUp.scss";
import { dispatchErrorMessage } from "../Common/FileUploadValidation";
import { BlockedInfo } from "../../../assets/images";
export const BlockPopUp = (props = {}) => {
  const { popUpToggleAction, dispatchAction, headerLabel, closeLabel, actionLabel, infoLabel } = props;

  const actionDispatch = () => {
    if (dispatchErrorMessage()) {
      dispatchAction();
    }
  };

  return (
    <div className="popup-wrapper BlockedPopUp">
      <div className="popup-container">
        <div className="popup-container-inner">
          <div className="popup-label">
            <label>{headerLabel}</label>
          </div>
          <div className="popup-noteinfo">
            <button type="button" className="popup btn-cancel" name="btn-cancel" onClick={popUpToggleAction}>
              {closeLabel}
            </button>
            <button type="button" className="popup btn-action" name="btn-action" onClick={actionDispatch}>
              {actionLabel}
            </button>
          </div>
          <div className="blockedInfo">
            <p>
              <i>
                <BlockedInfo />
              </i>
              <span>{infoLabel}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
