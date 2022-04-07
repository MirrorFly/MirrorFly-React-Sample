import React from "react";

const ActionPopup = (props = {}) => {
    const { 
        text = "",
        handleCancel,
        handleAction,
        handleActionText = "Ok",
        handleCancelText = "Cancel"
        }= props;
    return (
        <div className="userprofile">
            <div className="logout-popup lg">
                <div className="logout-label">
                    <h5>You're already in a call</h5>
                    <label>{text}</label>
                </div>
                <div className="logout-noteinfo">
                    <button
                        type="button"
                        name="btn-cancel"
                        className="btn-cancel"
                        onClick={handleCancel}>
                        {handleCancelText}
                    </button>
                    <button
                        type="button"
                        name="btn-logout"
                        className="btn-logout"
                        onClick={handleAction}>
                        {handleActionText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionPopup;
