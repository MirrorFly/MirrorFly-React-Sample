import React from "react";
import "./ActionInfoPopup.scss";
import Modal from '../WebChat/Common/Modal';
import OutsideClickHandler from "react-outside-click-handler";

const ActionInfoPopup = (props = {}) => {
    const {
        textInfo = "",
        children = "",
        textHeading = "",
        textActionBtn = "",
        jestActionBtn = "",
        jestCancelBtn = "",
        textCancelBtn = "",
        btnCancelClass = "",
        btnActionClass = "",
        handleCancel = () => { },
        handleAction = () => { },
    } = props;
    return (

        <Modal containerId="container">
            <div className="action_poppup_wraper">
                <OutsideClickHandler onOutsideClick={handleCancel}>
                    <div className="action_poppup_inner">
                        <div className="action_poppup_label">
                            <h4>{textHeading}</h4>
                            <label>{textInfo}</label>
                        </div>
                        {children}
                        <div className="action_poppup_noteinfo">
                            {textCancelBtn &&
                                <button
                                    type="button"
                                    className={`btn-cancel ${btnCancelClass}`}
                                    data-id={jestCancelBtn}
                                    onClick={handleCancel}>
                                    {textCancelBtn}
                                </button>
                            }
                            {textActionBtn &&
                                <button
                                    type="button"
                                    className={`btn-action  ${btnActionClass}`}
                                    data-id={jestActionBtn}
                                    onClick={(e)=>handleAction(e)}>
                                    {textActionBtn}
                                </button>
                            }
                        </div>
                    </div>
                </OutsideClickHandler>
            </div>
        </Modal>
    );
};
export default ActionInfoPopup;
