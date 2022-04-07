import React from "react";
import { CANCEL, REMOVE, REMOVE_YOUR_PROFILE_PHOTO } from "../../processENV";

const ProfileRemoveAlertPopUp = (props = {}) => {
    const {
        removeProfileImage,//click func
        handleProfileRemovephotoClose,//click func
    } = props;

    return (
        <div className="removephoto-container">
            <div className="removephoto-popup">
                <div className="removephoto-label">
                    <label>
                        {REMOVE_YOUR_PROFILE_PHOTO}
                    </label>
                </div>
                <div className="removephoto-noteinfo">
                    <button
                        type="button"
                        name="btn-cancel"
                        className="btn-cancel"
                        onClick={(e) => handleProfileRemovephotoClose(e)}
                    >
                        {CANCEL}
                    </button>
                    <button
                        type="button"
                        name="btn-remove"
                        className="btn-removephoto"
                        onClick={(e) => removeProfileImage(e)}
                    >
                        {REMOVE}
                    </button>
                </div>
            </div>
        </div>
    )
}
export default ProfileRemoveAlertPopUp;
